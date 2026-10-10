import React, { useState } from 'react';
import {
  X,
  Navigation,
  Globe,
  Search,
  MapPin,
  Compass,
  ArrowRight,
  Check,
} from 'lucide-react';
import { CITY_PRESETS, WORLD_OVERVIEW, CityPreset } from '../data/presets.ts';
import { MapViewport } from '../types.ts';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentViewport: MapViewport;
  onSelectPreset: (preset: CityPreset) => void;
  onUseCurrentLocation: () => void;
  onSearchLocation: (query: string) => void;
  isLocating: boolean;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  currentViewport,
  onSelectPreset,
  onUseCurrentLocation,
  onSearchLocation,
  isLocating,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [searchInput, setSearchInput] = useState('');

  if (!isOpen) return null;

  const regions = ['All', 'Americas', 'Europe', 'Asia', 'Oceania', 'Africa'];

  const filteredPresets = CITY_PRESETS.filter((preset) => {
    if (preset.name === WORLD_OVERVIEW.name) return true;
    const matchesRegion = selectedRegion === 'All' || preset.region === selectedRegion;
    const matchesSearch =
      !searchInput.trim() ||
      preset.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      preset.country.toLowerCase().includes(searchInput.toLowerCase()) ||
      preset.description.toLowerCase().includes(searchInput.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    onSearchLocation(searchInput.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-blue-500/30 rounded-2xl shadow-2xl shadow-blue-950/60 flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Choose Location on Earth
              </h3>
              <p className="text-[11px] text-slate-400">
                Use your current GPS location, view the whole world, or explore global cities
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="p-3.5 bg-slate-950/60 border-b border-slate-800">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search any city, country, landmark, or address in the world..."
                className="w-full bg-slate-800/90 text-xs sm:text-sm text-slate-100 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 outline-none border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={!searchInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-xs font-semibold text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>Fly To</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Action Highlights: Current GPS & Whole World */}
        <div className="p-3.5 bg-slate-900 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* GPS Location Button */}
          <button
            onClick={() => {
              onUseCurrentLocation();
              onClose();
            }}
            disabled={isLocating}
            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 hover:from-blue-900/60 hover:to-indigo-900/60 border border-blue-500/40 text-left transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="font-bold text-xs text-blue-200 flex items-center gap-1">
                <span>Use My Current Location</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-normal">
                  GPS
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Detect your physical position via browser GPS
              </div>
            </div>
          </button>

          {/* Whole World Overview Button */}
          <button
            onClick={() => {
              onSelectPreset(WORLD_OVERVIEW);
              onClose();
            }}
            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-950/50 to-teal-950/50 hover:from-emerald-900/60 hover:to-teal-900/60 border border-emerald-500/40 text-left transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-emerald-200 flex items-center gap-1">
                <span>Whole World Overview</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-normal">
                  Global
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Zoom out to see the entire planet and click anywhere
              </div>
            </div>
          </button>
        </div>

        {/* Region Filter Tabs */}
        <div className="px-4 py-2 border-b border-slate-800 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 shrink-0">
            Region:
          </span>
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedRegion === region
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              {region}
            </button>
          ))}
        </div>

        {/* Worldwide Cities Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
            <span>Worldwide Destinations ({filteredPresets.length})</span>
            <span className="text-slate-500 text-[10px]">
              Active: {currentViewport.locationName || 'Current Location'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredPresets.map((city) => {
              const isSelected =
                currentViewport.locationName.toLowerCase().includes(city.name.toLowerCase());

              return (
                <div
                  key={city.name}
                  onClick={() => {
                    onSelectPreset(city);
                    onClose();
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-blue-900/30 border-blue-500 shadow-md ring-1 ring-blue-500'
                      : 'bg-slate-800/70 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <span className="text-xl shrink-0 mt-0.5">
                    {city.flag || '📍'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-xs text-white truncate">
                        {city.name}
                      </h4>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] text-blue-300 font-medium">
                      {city.country}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                      {city.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Hint */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span>Tip: You can also click anywhere on the Google Map to pick that spot.</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-300 hover:text-white px-2 py-1 rounded cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
