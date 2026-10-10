/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
// Source: Google Maps Platform Code Assist
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import {
  MessageSquare,
  Map as MapIcon,
  Sparkles,
  Share2,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  Globe,
  Navigation,
  Columns2,
} from 'lucide-react';
import { MapComponent } from './components/MapComponent.tsx';
import { ChatPanel } from './components/ChatPanel.tsx';
import { LocationPickerModal } from './components/LocationPickerModal.tsx';
import { DigitalClock } from './components/DigitalClock.tsx';
import { ContactModal } from './components/ContactModal.tsx';
import { DeveloperProfileModal } from './components/DeveloperProfileModal.tsx';
import { FooterBar } from './components/FooterBar.tsx';
import { ChatMessage, Place, MapViewport, PersonaId, DrawingMode, LatLngPoint, DrawingMeasurement } from './types.ts';
import { CITY_PRESETS, WORLD_OVERVIEW, CityPreset, PERSONAS } from './data/presets.ts';

const GOOGLE_MAPS_API_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';

// Parse initial viewport from Web URL query parameters for deep-linking
const getInitialViewport = (): MapViewport => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const lat = parseFloat(params.get('lat') || '');
    const lng = parseFloat(params.get('lng') || '');
    const zoom = parseInt(params.get('zoom') || '', 10);
    const city = params.get('city');

    if (!isNaN(lat) && !isNaN(lng)) {
      return {
        center: { lat, lng },
        zoom: !isNaN(zoom) ? zoom : 14,
        locationName: city || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      };
    }
  }
  return {
    center: CITY_PRESETS[1].center, // Default to San Francisco
    zoom: CITY_PRESETS[1].zoom,
    locationName: `${CITY_PRESETS[1].name}, ${CITY_PRESETS[1].country}`,
  };
};

export default function App() {
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  // Default to 'split' on mobile so the Google Map is open and visible immediately with the web app!
  const [mobileTab, setMobileTab] = useState<'split' | 'map' | 'chat'>('split');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Map viewport state with web deep-link initialization
  const [viewport, setViewport] = useState<MapViewport>(getInitialViewport);

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');

  // Selected place for InfoWindow / inspection
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Contact Me modal state
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Developer Profile modal state
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Drawing overlay state (distance measurement & polygon areas)
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('none');
  const [drawingPoints, setDrawingPoints] = useState<LatLngPoint[]>([]);

  // Sync viewport to web URL query parameters without reloading
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      params.set('lat', viewport.center.lat.toFixed(4));
      params.set('lng', viewport.center.lng.toFixed(4));
      params.set('zoom', String(viewport.zoom));
      if (viewport.locationName) {
        params.set('city', viewport.locationName);
      }
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, '', newUrl);
    }, 400);

    return () => clearTimeout(timer);
  }, [viewport]);

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

  // Web Share / Copy Web Link handler
  const handleCopyShareLink = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    }
  };

  // Choose user's current GPS location
  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const userLoc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setViewport((prev) => ({
          ...prev,
          center: userLoc,
          zoom: 15,
          locationName: 'My Current Location (GPS)',
        }));
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err.message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  // Preset location selection (supports Whole World Overview or any city)
  const handleSelectPreset = useCallback((preset: CityPreset) => {
    setViewport({
      center: preset.center,
      zoom: preset.zoom,
      locationName: preset.name === WORLD_OVERVIEW.name ? 'Whole World' : `${preset.name}, ${preset.country}`,
    });
  }, []);

  // Search location handler
  const handleSearchLocation = useCallback((query: string) => {
    // If geocoding is available in window
    const gmaps = (window as any).google;
    if (gmaps?.maps) {
      const geocoder = new gmaps.maps.Geocoder();
      geocoder.geocode({ address: query }, (results: any[], status: string) => {
        if (status === 'OK' && results && results[0]) {
          const loc = results[0].geometry.location;
          setViewport({
            center: { lat: loc.lat(), lng: loc.lng() },
            zoom: 13,
            locationName: results[0].formatted_address,
          });
        }
      });
    }
  }, []);

  // Send message to Gemini server API
  const handleSendMessage = useCallback(
    async (text: string, personaId: PersonaId = 'guide') => {
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
    if (window.innerWidth < 768) {
      setMobileTab('chat');
    }
  };

  const handleAskAboutDrawing = useCallback(
    (measurement: DrawingMeasurement) => {
      let prompt = '';
      if (measurement.mode === 'distance') {
        const km = (measurement.totalDistanceMeters / 1000).toFixed(2);
        const miles = (measurement.totalDistanceMeters * 0.000621371).toFixed(2);
        const walkMinutes = Math.round(measurement.totalDistanceMeters / 80);
        prompt = `I measured a route of ${km} km (${miles} miles, approximately ${walkMinutes} minutes walking time) with ${measurement.points.length} waypoints in ${viewport.locationName}. What are the highlights, terrain conditions, walking tips, and recommended spots along this route?`;
      } else if (measurement.mode === 'polygon') {
        const sqKm = measurement.totalAreaSquareMeters
          ? (measurement.totalAreaSquareMeters / 1000000).toFixed(2)
          : '0';
        const acres = measurement.totalAreaSquareMeters
          ? (measurement.totalAreaSquareMeters * 0.000247105).toFixed(1)
          : '0';
        prompt = `I defined a polygon area of interest of ~${acres} acres (${sqKm} km²) around ${viewport.locationName}. What is this specific neighborhood or area known for, what are the top places to visit or dine inside it, and what are its key features?`;
      }

      if (prompt) {
        setInputPrompt('');
        if (window.innerWidth < 768) {
          setMobileTab('chat');
        }
        handleSendMessage(prompt);
      }
    },
    [viewport.locationName, handleSendMessage]
  );

  const handleClearHistory = () => {
    setMessages([]);
    setSelectedPlace(null);
  };

  return (
    <div className="flex flex-col h-[100dvh] w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-text">
      {/* Required In-App Quota Warning Banner (Tier 1 & Tier 2 Google Maps Quota Defense) */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm shrink-0">
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

      {/* Top Application Header Bar with Live Digital Clock & Contact Controls */}
      <header className="w-full bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-blue-900/40 px-3 sm:px-4 py-2 shrink-0 z-30 flex items-center justify-between gap-2 select-none shadow-md">
        {/* Left: Branding & Tagline */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 shadow-md shadow-blue-600/30 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base text-white tracking-tight bg-gradient-to-r from-white via-blue-100 to-cyan-300 bg-clip-text text-transparent">
                GeoChat AI
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-400/30 uppercase tracking-wider">
                Real-Time Maps
              </span>
            </div>
            <p className="hidden md:block text-[10px] text-blue-200/80 truncate">
              Interactive Map Intelligence & Gemini Grounded AI
            </p>
          </div>
        </div>

        {/* Center: Stylish Live Digital Clock */}
        <div className="flex items-center justify-center">
          <DigitalClock />
        </div>

        {/* Right: Quick Action Controls (Contact Me, Profile, Location, Share) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Developer Profile Button */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-100 hover:text-cyan-300 text-xs font-semibold border border-blue-500/35 transition-all cursor-pointer shadow-sm group"
            title="View Isack Christopher's professional background & education"
          >
            <div className="w-5 h-5 rounded-full overflow-hidden border border-cyan-400 shrink-0 bg-slate-800">
              <img
                src="https://isackchristopher.netlify.app/profile.jpg"
                alt="Isack Christopher"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <span className="hidden lg:inline">Isack Christopher</span>
            <span className="hidden sm:inline lg:hidden">Profile</span>
          </button>

          {/* Contact Me Button */}
          <button
            onClick={() => setIsContactOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md shadow-blue-900/40 border border-cyan-400/30 transition-all cursor-pointer group"
            title="Contact Developer Isack Christopher (WhatsApp: +255747689977 | christopherisack64@gmail.com)"
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-200 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Contact Me</span>
            <span className="sm:hidden">Contact</span>
          </button>

          {/* Quick Location Button */}
          <button
            onClick={() => setIsLocationPickerOpen(true)}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-blue-200 border border-blue-500/30 text-xs font-semibold transition-colors cursor-pointer"
            title="Explore any place or whole world"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span className="truncate max-w-[110px]">{viewport.locationName || 'Location'}</span>
          </button>

          {/* Share Web Link */}
          <button
            onClick={handleCopyShareLink}
            title={linkCopied ? 'Link Copied to Clipboard!' : 'Share Web Link'}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all text-xs font-medium flex items-center gap-1 cursor-pointer ${
              linkCopied
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                : 'bg-slate-900 hover:bg-slate-850 border-blue-500/30 text-slate-300 hover:text-white'
            }`}
          >
            {linkCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline text-[11px]">Share</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Dual-Pane Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Pane: Chatbot Panel */}
        <div
          className={`w-full md:w-[460px] lg:w-[500px] h-full shrink-0 z-10 flex flex-col transition-all duration-300 ${
            mobileTab === 'chat'
              ? 'flex'
              : mobileTab === 'split'
              ? 'flex h-[52%] md:h-full border-t border-slate-800 md:border-t-0'
              : 'hidden md:flex'
          } ${!isSidebarOpen ? 'md:hidden' : ''}`}
        >
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            viewport={viewport}
            selectedPlace={selectedPlace}
            onSelectPlace={(p) => {
              setSelectedPlace(p);
              if (window.innerWidth < 768 && mobileTab === 'chat') {
                setMobileTab('map');
              }
            }}
            onClearHistory={handleClearHistory}
            inputPrompt={inputPrompt}
            setInputPrompt={setInputPrompt}
            onShareLink={handleCopyShareLink}
            linkCopied={linkCopied}
            onToggleSidebar={() => setIsSidebarOpen(false)}
            onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
            onOpenContact={() => setIsContactOpen(true)}
          />
        </div>

        {/* Floating Expand Sidebar Button (when sidebar is closed on desktop) */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            title="Expand GeoChat Panel"
            className="hidden md:flex absolute top-3 left-3 z-30 items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/95 hover:bg-slate-800 text-slate-200 border border-blue-500/30 shadow-2xl backdrop-blur-md transition-all cursor-pointer font-medium text-xs group"
          >
            <PanelLeftOpen className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            <span>Open GeoChat</span>
            {messages.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-[10px] flex items-center justify-center font-bold text-white">
                {messages.length}
              </span>
            )}
          </button>
        )}

        {/* Right Pane: Interactive Google Map */}
        <div
          className={`flex-1 relative ${
            mobileTab === 'map'
              ? 'flex h-full'
              : mobileTab === 'split'
              ? 'flex h-[48%] md:h-full'
              : 'hidden md:flex h-full'
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
              onShareLink={handleCopyShareLink}
              linkCopied={linkCopied}
              onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
              drawingMode={drawingMode}
              onDrawingModeChange={setDrawingMode}
              drawingPoints={drawingPoints}
              onDrawingPointsChange={setDrawingPoints}
              onAskAboutDrawing={handleAskAboutDrawing}
            />
          </APIProvider>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Split View, Full Map, Full Chat) */}
      <div className="md:hidden flex items-center justify-around bg-slate-950 border-t border-blue-900/40 py-2 px-3 shrink-0 z-30">
        <button
          onClick={() => setMobileTab('split')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            mobileTab === 'split'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Columns2 className="w-3.5 h-3.5" />
          <span>Split View</span>
        </button>

        <button
          onClick={() => setMobileTab('map')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            mobileTab === 'map'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MapIcon className="w-3.5 h-3.5" />
          <span>Full Map</span>
          {allPlaces.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-emerald-700 text-[10px] flex items-center justify-center font-bold">
              {allPlaces.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setMobileTab('chat')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            mobileTab === 'chat'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Full Chat</span>
          {messages.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-blue-800 text-[10px] flex items-center justify-center font-bold">
              {messages.length}
            </span>
          )}
        </button>
      </div>

      {/* Developer Credit & Dynamic Copyright Footer Bar */}
      <FooterBar
        onOpenContact={() => setIsContactOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Location Chooser Modal (GPS / Whole World / Search / Global Cities) */}
      <LocationPickerModal
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        currentViewport={viewport}
        onSelectPreset={handleSelectPreset}
        onUseCurrentLocation={handleUseCurrentLocation}
        onSearchLocation={handleSearchLocation}
        isLocating={isLocating}
      />

      {/* Contact Developer Modal with WhatsApp & Email */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Developer Profile Modal based on isackchristopher.netlify.app */}
      <DeveloperProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}
