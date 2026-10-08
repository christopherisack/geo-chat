import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send,
  Sparkles,
  MapPin,
  Compass,
  Star,
  ExternalLink,
  RotateCcw,
  Search,
  Globe,
  Zap,
  Check,
  Copy,
  Landmark,
  Utensils,
  Coffee,
  Trees,
  Train,
  ShoppingBag,
  HelpCircle,
  Layers,
  Info,
  Share2,
  PanelLeftClose,
} from 'lucide-react';
import { ChatMessage, Place, MapViewport, PersonaId, PlaceCategory } from '../types.ts';
import { PERSONAS, SAMPLE_PROMPTS } from '../data/presets.ts';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, personaId: PersonaId) => void;
  isLoading: boolean;
  viewport: MapViewport;
  selectedPlace: Place | null;
  onSelectPlace: (place: Place | null) => void;
  onClearHistory: () => void;
  inputPrompt: string;
  setInputPrompt: (val: string) => void;
  onShareLink?: () => void;
  linkCopied?: boolean;
  onToggleSidebar?: () => void;
  onOpenLocationPicker?: () => void;
}

const CATEGORY_ICONS: Record<PlaceCategory, React.ComponentType<{ className?: string }>> = {
  restaurant: Utensils,
  cafe: Coffee,
  attraction: Landmark,
  park: Trees,
  transit: Train,
  hotel: Landmark,
  shopping: ShoppingBag,
  other: HelpCircle,
};

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  isLoading,
  viewport,
  selectedPlace,
  onSelectPlace,
  onClearHistory,
  inputPrompt,
  setInputPrompt,
  onShareLink,
  linkCopied,
  onToggleSidebar,
  onOpenLocationPicker,
}) => {
  const [selectedPersonaId, setSelectedPersonaId] = useState<PersonaId>('guide');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activePersona = PERSONAS.find((p) => p.id === selectedPersonaId) || PERSONAS[0];

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isLoading) return;
    onSendMessage(inputPrompt.trim(), selectedPersonaId);
    setInputPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Handle Enter key (Shift+Enter for newline)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-100 overflow-hidden select-text">
      {/* Top Header */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-sm flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-400 p-0.5 shadow-md shadow-blue-900/30">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-sm tracking-tight text-white">GeoChat</h1>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Web App
              </span>
            </div>
            {onOpenLocationPicker ? (
              <button
                onClick={onOpenLocationPicker}
                title="Click to choose location: GPS, Whole World, or Global Cities"
                className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-blue-300 truncate max-w-[190px] cursor-pointer transition-colors text-left group"
              >
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate">{viewport.locationName || 'Current Location'}</span>
                <span className="text-[10px] text-blue-400 font-semibold underline shrink-0 ml-0.5">Edit</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate max-w-[190px]">
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{viewport.locationName || 'Current Location'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Header Action Buttons: Share Link, Clear History, Collapse Sidebar */}
        <div className="flex items-center gap-1">
          {onShareLink && (
            <button
              onClick={onShareLink}
              title={linkCopied ? 'Web link copied!' : 'Share Web Link'}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                linkCopied
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700/80 text-slate-300 hover:text-white'
              }`}
            >
              {linkCopied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>
          )}

          {messages.length > 0 && (
            <button
              onClick={onClearHistory}
              title="Reset conversation"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              title="Hide sidebar to view full map"
              className="hidden md:flex p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Persona & Model Selector Bar */}
      <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {PERSONAS.map((persona) => {
            const isSelected = persona.id === selectedPersonaId;
            return (
              <button
                key={persona.id}
                onClick={() => setSelectedPersonaId(persona.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-700/40 border border-blue-500'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700/60'
                }`}
              >
                {persona.id === 'guide' && <Compass className="w-3.5 h-3.5" />}
                {persona.id === 'scout' && <Zap className="w-3.5 h-3.5" />}
                {persona.id === 'concierge' && <Sparkles className="w-3.5 h-3.5" />}
                {persona.id === 'historian' && <Landmark className="w-3.5 h-3.5" />}
                <span>{persona.name}</span>
                {persona.searchGrounded && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Google Search Grounding active" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Persona Banner Details */}
      <div className="px-3.5 py-1.5 bg-blue-950/20 border-b border-blue-900/30 flex items-center justify-between text-[11px] text-blue-300 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-blue-200">{activePersona.model}:</span>
          <span className="text-slate-300 truncate max-w-[240px]">{activePersona.tagline}</span>
        </div>
        {activePersona.searchGrounded && (
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
            <Globe className="w-3 h-3" />
            <span>Search Grounded</span>
          </div>
        )}
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center px-4 py-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-3">
              <Compass className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-base font-bold text-white mb-1">
              Ask anything about {viewport.locationName || 'this area'}
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
              Explore real-time Google Maps places, discover trending spots with Google Search grounding, check open hours, or plan custom itineraries.
            </p>

            {/* Starter Prompt Cards */}
            <div className="w-full space-y-1.5 text-left">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Suggested questions for this map view
              </div>
              {SAMPLE_PROMPTS.slice(0, 4).map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(sample.prompt, selectedPersonaId)}
                  className="w-full p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/40 text-xs text-slate-200 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <span className="font-medium group-hover:text-blue-300 transition-colors">
                    {sample.label}
                  </span>
                  <Send className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isUser = message.role === 'user';
            const isCopied = copiedId === message.id;

            return (
              <div
                key={message.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}
              >
                {/* Bubble Container */}
                <div
                  className={`max-w-[92%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-slate-800/90 text-slate-100 rounded-bl-xs border border-slate-700/70'
                  }`}
                >
                  {/* Assistant Header Tag */}
                  {!isUser && (
                    <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-700/50 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5 font-medium text-blue-300">
                        <Sparkles className="w-3 h-3 text-blue-400" />
                        <span>GeoChat</span>
                        {message.modelUsed && (
                          <span className="text-[10px] text-slate-400 bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-700/40">
                            {message.modelUsed}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleCopyText(message.id, message.content)}
                        className="p-1 hover:text-white transition-colors"
                        title="Copy answer"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Message Content with Markdown */}
                  <div className="prose prose-invert prose-xs max-w-none prose-p:my-1.5 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-white">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>

                  {/* Interactive Recommended Place Cards inside response */}
                  {message.places && message.places.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/60">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-2">
                        <span className="flex items-center gap-1 text-blue-400">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Pinned on Map ({message.places.length})</span>
                        </span>
                        <span className="text-[10px] text-slate-400">Click to view location</span>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {message.places.map((place) => {
                          const isSelected = selectedPlace?.id === place.id;
                          const IconComp = CATEGORY_ICONS[place.category] || HelpCircle;

                          return (
                            <div
                              key={place.id}
                              onClick={() => onSelectPlace(place)}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-900/40 border-blue-500 shadow-md ring-1 ring-blue-500'
                                  : 'bg-slate-900/70 border-slate-700/70 hover:bg-slate-900 hover:border-slate-600'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="p-1 rounded-lg bg-slate-800 text-blue-400 border border-slate-700">
                                    <IconComp className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-xs text-white leading-tight">
                                      {place.name}
                                    </h4>
                                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                                      {place.category}
                                    </span>
                                  </div>
                                </div>

                                {place.rating && (
                                  <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
                                    <Star className="w-3 h-3 fill-amber-400" />
                                    <span>{place.rating.toFixed(1)}</span>
                                  </div>
                                )}
                              </div>

                              <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                                {place.description}
                              </p>

                              {place.address && (
                                <div className="text-[10px] text-slate-400 mt-1 truncate">
                                  📍 {place.address}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Google Search Grounding Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/50">
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 mb-1.5">
                        <Globe className="w-3 h-3" />
                        <span>Google Search Grounding Sources</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {message.sources.map((source, sIdx) => (
                          <a
                            key={sIdx}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700 hover:border-emerald-500/50 text-[10px] text-slate-300 hover:text-emerald-300 transition-colors"
                            title={source.uri}
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[140px]">{source.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <div className="text-[10px] text-slate-500 px-1">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start space-y-2">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-xs p-3.5 text-xs text-slate-300 flex items-center gap-3 shadow-sm">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
              <div className="flex flex-col">
                <span className="font-semibold text-slate-200">
                  {activePersona.name} is searching...
                </span>
                <span className="text-[10px] text-slate-400">
                  Grounding with Google Maps & real-time search data
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      {messages.length > 0 && (
        <div className="px-3 py-1.5 bg-slate-950/40 border-t border-slate-800/60 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
          {SAMPLE_PROMPTS.slice(0, 5).map((sample, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(sample.prompt, selectedPersonaId)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-[11px] text-slate-300 hover:text-white whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
            >
              {sample.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
        <form onSubmit={handleSubmit} className="relative flex flex-col gap-2">
          <div className="relative flex items-center">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask about places, food, hours, history in ${viewport.locationName || 'this area'}...`}
              disabled={isLoading}
              className="w-full bg-slate-800/90 text-xs sm:text-sm text-slate-100 placeholder-slate-400 rounded-xl px-3.5 py-2.5 pr-11 outline-none border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none max-h-32"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className="absolute right-2 p-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white transition-all shadow-md cursor-pointer"
              title="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <div className="flex items-center gap-1 truncate">
              <Compass className="w-3 h-3 text-blue-400" />
              <span>Map Context: {viewport.locationName || 'Active Coordinates'}</span>
            </div>
            <span className="text-[10px] text-slate-400">Shift+Enter for newline</span>
          </div>
        </form>
      </div>
    </div>
  );
};
