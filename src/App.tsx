/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
// Source: Google Maps Platform Code Assist
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { MessageSquare, Map as MapIcon, Sparkles, AlertCircle } from 'lucide-react';
import { MapComponent } from './components/MapComponent.tsx';
import { ChatPanel } from './components/ChatPanel.tsx';
import { ChatMessage, Place, MapViewport, PersonaId } from './types.ts';
import { CITY_PRESETS, PERSONAS } from './data/presets.ts';

const GOOGLE_MAPS_API_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';

export default function App() {
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [mobileTab, setMobileTab] = useState<'chat' | 'map'>('chat');

  // Map viewport state
  const [viewport, setViewport] = useState<MapViewport>({
    center: CITY_PRESETS[0].center,
    zoom: CITY_PRESETS[0].zoom,
    locationName: `${CITY_PRESETS[0].name}, ${CITY_PRESETS[0].country}`,
  });

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');

  // Selected place for InfoWindow / inspection
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // All active places accumulated from assistant recommendations
  const allPlaces = useMemo(() => {
    const list: Place[] = [];
    const seen = new Set<string>();

    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.places) {
        for (const p of msg.places) {
          if (!seen.has(p.name)) {
            seen.add(p.name);
            list.push(p);
          }
        }
      }
    }
    return list;
  }, [messages]);

  // Tier 1 & 2 Quota Defense listener as mandated by Google Maps skill
  useEffect(() => {
    const handleQuotaExceeded = () => {
      setQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    };
  }, []);

  // Send message to Gemini server API
  const handleSendMessage = useCallback(
    async (text: string, personaId: PersonaId) => {
      if (!text.trim() || isLoading) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: Date.now(),
        locationContext: viewport.locationName,
      };

      const updatedHistory = [...messages, userMessage];
      setMessages(updatedHistory);
      setIsLoading(true);

      const targetPersona = PERSONAS.find((p) => p.id === personaId) || PERSONAS[0];

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedHistory.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            mapContext: {
              center: viewport.center,
              zoom: viewport.zoom,
              locationName: viewport.locationName,
              selectedPlace: selectedPlace
                ? {
                    name: selectedPlace.name,
                    address: selectedPlace.address,
                    lat: selectedPlace.lat,
                    lng: selectedPlace.lng,
                    rating: selectedPlace.rating,
                  }
                : undefined,
              visiblePlacesCount: allPlaces.length,
            },
            modelType: targetPersona.model,
            persona: targetPersona.id,
          }),
        });

        if (res.status === 429) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with ${res.status}`);
        }

        const data = await res.json();

        const modelMessage: ChatMessage = {
          id: `model-${Date.now()}`,
          role: 'model',
          content: data.text,
          timestamp: Date.now(),
          places: data.places || [],
          sources: data.sources || [],
          searchQueries: data.searchQueries || [],
          modelUsed: data.modelUsed,
        };

        setMessages((prev) => [...prev, modelMessage]);

        // Auto-select first recommended place if any returned
        if (data.places && data.places.length > 0) {
          setSelectedPlace(data.places[0]);
        }
      } catch (err: any) {
        console.error('Chat request error:', err);
        const errorMessage: ChatMessage = {
          id: `err-${Date.now()}`,
          role: 'model',
          content: `⚠️ **Unable to complete request:** ${err.message || 'An unexpected error occurred'}. Please try asking again.`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, viewport, selectedPlace, allPlaces.length]
  );

  const handleAskAboutPlace = (place: Place) => {
    const prompt = `Tell me more about ${place.name} (${place.address || 'near here'}). What is it best known for, when is the best time to visit, and what tips do you have?`;
    setInputPrompt(prompt);
    setMobileTab('chat');
  };

  const handleClearHistory = () => {
    setMessages([]);
    setSelectedPlace(null);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Required In-App Quota Warning Banner (Tier 1 & Tier 2 Google Maps Quota Defense) */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm shrink-0">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Main Dual-Pane Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Pane: Chatbot Panel */}
        <div
          className={`w-full md:w-[460px] lg:w-[500px] h-full shrink-0 z-10 flex flex-col ${
            mobileTab === 'chat' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            viewport={viewport}
            selectedPlace={selectedPlace}
            onSelectPlace={(p) => {
              setSelectedPlace(p);
              if (window.innerWidth < 768) {
                setMobileTab('map');
              }
            }}
            onClearHistory={handleClearHistory}
            inputPrompt={inputPrompt}
            setInputPrompt={setInputPrompt}
          />
        </div>

        {/* Right Pane: Interactive Google Map */}
        <div
          className={`flex-1 h-full relative ${
            mobileTab === 'map' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <APIProvider
            apiKey={GOOGLE_MAPS_API_KEY}
            libraries={['places', 'geometry', 'marker', 'geocoding']}
          >
            <MapComponent
              viewport={viewport}
              onViewportChange={setViewport}
              places={allPlaces}
              selectedPlace={selectedPlace}
              onSelectPlace={setSelectedPlace}
              onAskAboutPlace={handleAskAboutPlace}
            />
          </APIProvider>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden flex items-center justify-around bg-slate-900 border-t border-slate-800 py-2.5 px-4 shrink-0 z-30">
        <button
          onClick={() => setMobileTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            mobileTab === 'chat'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat</span>
          {messages.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-blue-800 text-[10px] flex items-center justify-center font-bold">
              {messages.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setMobileTab('map')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            mobileTab === 'map'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MapIcon className="w-4 h-4" />
          <span>Map</span>
          {allPlaces.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-emerald-700 text-[10px] flex items-center justify-center font-bold">
              {allPlaces.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
