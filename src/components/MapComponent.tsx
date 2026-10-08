// Source: Google Maps Platform Code Assist
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {
  Compass,
  Navigation,
  Layers,
  MapPin,
  Star,
  ExternalLink,
  MessageSquare,
  Search,
  Maximize2,
  Utensils,
  Coffee,
  Landmark,
  Trees,
  Train,
  ShoppingBag,
  HelpCircle,
  Share2,
  Check,
  Eye,
  Navigation2,
  Globe,
} from 'lucide-react';
import { Place, MapViewport, PlaceCategory } from '../types.ts';
import { CITY_PRESETS } from '../data/presets.ts';

interface MapComponentProps {
  viewport: MapViewport;
  onViewportChange: (viewport: MapViewport) => void;
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place | null) => void;
  onAskAboutPlace: (place: Place) => void;
  onShareLink?: () => void;
  linkCopied?: boolean;
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

const CATEGORY_COLORS: Record<PlaceCategory, { bg: string; border: string; glyph: string }> = {
  restaurant: { bg: '#EA580C', border: '#C2410C', glyph: '#FFFFFF' },
  cafe: { bg: '#D97706', border: '#B45309', glyph: '#FFFFFF' },
  attraction: { bg: '#8B5CF6', border: '#7C3AED', glyph: '#FFFFFF' },
  park: { bg: '#10B981', border: '#059669', glyph: '#FFFFFF' },
  transit: { bg: '#0284C7', border: '#0369A1', glyph: '#FFFFFF' },
  hotel: { bg: '#6366F1', border: '#4F46E5', glyph: '#FFFFFF' },
  shopping: { bg: '#EC4899', border: '#DB2777', glyph: '#FFFFFF' },
  other: { bg: '#64748B', border: '#475569', glyph: '#FFFFFF' },
};

export const MapComponent: React.FC<MapComponentProps> = ({
  viewport,
  onViewportChange,
  places,
  selectedPlace,
  onSelectPlace,
  onAskAboutPlace,
  onShareLink,
  linkCopied,
  onOpenLocationPicker,
}) => {
  const map = useMap();
  const geocodingLib = useMapsLibrary('geocoding');
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [selectedCity, setSelectedCity] = useState(CITY_PRESETS[0].name);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const geocoderRef = useRef<any>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Map click handler to choose any spot in the world
  const handleMapClick = useCallback(
    (e: any) => {
      const latLng = e.detail?.latLng;
      if (!latLng) return;
      const lat = typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat;
      const lng = typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng;
      if (lat != null && lng != null) {
        resolveLocationName(lat, lng);
        showToast(`📍 Set location on map: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    },
    []
  );

  // Initialize geocoder when library loads
  useEffect(() => {
    if (geocodingLib && !geocoderRef.current) {
      try {
        geocoderRef.current = new geocodingLib.Geocoder();
      } catch (err) {
        console.warn('Geocoder init fallback:', err);
      }
    }
  }, [geocodingLib]);

  // Reverse geocode when center changes significantly to update location name
  const resolveLocationName = useCallback(
    (lat: number, lng: number) => {
      if (!geocoderRef.current) return;
      geocoderRef.current.geocode(
        { location: { lat, lng } },
        (results: any[], status: string) => {
          if (status === 'OK' && results && results[0]) {
            const result = results[0];
            // Find neighborhood or locality or formatted address
            let name = '';
            for (const comp of result.address_components) {
              if (comp.types.includes('neighborhood') || comp.types.includes('sublocality')) {
                name = comp.long_name;
                break;
              }
            }
            if (!name) {
              for (const comp of result.address_components) {
                if (comp.types.includes('locality')) {
                  name = comp.long_name;
                  break;
                }
              }
            }
            if (name) {
              const countryComp = result.address_components.find((c: any) =>
                c.types.includes('country')
              );
              const fullName = countryComp ? `${name}, ${countryComp.short_name}` : name;
              onViewportChange({
                ...viewport,
                center: { lat, lng },
                locationName: fullName,
              });
            }
          }
        }
      );
    },
    [onViewportChange, viewport]
  );

  // Map drag / camera change handler
  const handleCameraChange = useCallback(
    () => {
      if (!map) return;
      const center = map.getCenter();
      const zoom = map.getZoom();
      if (center) {
        const lat = center.lat();
        const lng = center.lng();
        onViewportChange({
          ...viewport,
          center: { lat, lng },
          zoom: zoom || viewport.zoom,
        });
      }
    },
    [map, onViewportChange, viewport]
  );

  // Pan to selected place
  useEffect(() => {
    if (map && selectedPlace) {
      map.panTo({ lat: selectedPlace.lat, lng: selectedPlace.lng });
      if ((map.getZoom() || 0) < 15) {
        map.setZoom(16);
      }
    }
  }, [map, selectedPlace]);

  // Fit all places into map view
  const handleFitBounds = useCallback(() => {
    const gmaps = (window as any).google;
    if (!map || places.length === 0 || !gmaps?.maps) return;
    const bounds = new gmaps.maps.LatLngBounds();
    places.forEach((p) => {
      bounds.extend({ lat: p.lat, lng: p.lng });
    });
    map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
  }, [map, places]);

  // Jump to predefined city
  const handleCitySelect = (cityName: string) => {
    const preset = CITY_PRESETS.find((c) => c.name === cityName);
    if (!preset || !map) return;
    setSelectedCity(cityName);
    map.panTo(preset.center);
    map.setZoom(preset.zoom);
    onViewportChange({
      center: preset.center,
      zoom: preset.zoom,
      locationName: `${preset.name}, ${preset.country}`,
    });
  };

  // Locate user with geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.');
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
        if (map) {
          map.panTo(userLoc);
          map.setZoom(15);
        }
        resolveLocationName(userLoc.lat, userLoc.lng);
      },
      (err) => {
        setIsLocating(false);
        showToast(`Could not obtain position: ${err.message}`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Simple location search handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !geocoderRef.current || !map) return;
    geocoderRef.current.geocode({ address: searchQuery }, (results: any[], status: string) => {
      if (status === 'OK' && results && results[0]) {
        const loc = results[0].geometry.location;
        map.panTo(loc);
        map.setZoom(14);
        onViewportChange({
          center: { lat: loc.lat(), lng: loc.lng() },
          zoom: 14,
          locationName: results[0].formatted_address,
        });
        setSearchQuery('');
      } else {
        showToast('Could not find location. Please try a different query.');
      }
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-slate-100 text-xs px-3.5 py-2 rounded-xl border border-slate-700 shadow-xl backdrop-blur-md animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* Top Floating Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left Toolbar: Location Picker & Search */}
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-xl p-1.5 shadow-xl">
          {/* Prominent Location & Whole World Button */}
          {onOpenLocationPicker && (
            <button
              onClick={onOpenLocationPicker}
              title="Choose current location, whole world, or global cities"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-blue-900/30 transition-all cursor-pointer border border-blue-400/30 shrink-0"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Choose Location</span>
              <span className="sm:hidden">Location</span>
            </button>
          )}

          {/* Quick Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5 px-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any place in the world..."
              className="bg-transparent text-xs md:text-sm text-slate-100 placeholder-slate-400 outline-none w-36 sm:w-52"
            />
          </form>

          <div className="w-[1px] h-6 bg-slate-700 mx-1" />

          {/* Quick City Presets Dropdown */}
          <div className="flex items-center gap-1 px-1">
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={selectedCity}
              onChange={(e) => handleCitySelect(e.target.value)}
              className="bg-slate-800 text-xs text-slate-200 rounded-lg px-2 py-1 outline-none border border-slate-700 cursor-pointer hover:bg-slate-750 max-w-[130px] truncate"
            >
              {CITY_PRESETS.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.flag ? `${city.flag} ` : ''}{city.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Toolbar: View buttons */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-xl p-1.5 shadow-xl">
          {/* Fit all places button */}
          {places.length > 0 && (
            <button
              onClick={handleFitBounds}
              title="Fit all recommended places on map"
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 rounded-lg hover:bg-emerald-900/80 transition-all shadow-sm"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Fit {places.length} Pins</span>
            </button>
          )}

          {/* Locate Me */}
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            title="Locate my position"
            className="p-1.5 text-slate-300 hover:text-blue-400 bg-slate-800 hover:bg-slate-750 rounded-lg border border-slate-700 transition-colors"
          >
            <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          {/* Share Web Link */}
          {onShareLink && (
            <button
              onClick={onShareLink}
              title={linkCopied ? 'Web link copied!' : 'Share Web Link with current map view'}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                linkCopied
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
              }`}
            >
              {linkCopied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Map Type Toggle */}
          <button
            onClick={() => setMapType((t) => (t === 'roadmap' ? 'satellite' : 'roadmap'))}
            title="Toggle Satellite Imagery"
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs border transition-colors cursor-pointer ${
              mapType === 'satellite'
                ? 'bg-blue-600 text-white border-blue-500 font-medium'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {mapType === 'roadmap' ? 'Satellite' : 'Roadmap'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Map Viewport */}
      <div className="relative w-full h-full flex-1">
        <Map
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          defaultCenter={viewport.center}
          defaultZoom={viewport.zoom}
          mapTypeId={mapType}
          gestureHandling="greedy"
          disableDefaultUI={false}
          onCameraChanged={handleCameraChange}
          onClick={handleMapClick}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Active Place Markers */}
          {places.map((place) => {
            const isSelected = selectedPlace?.id === place.id;
            const style = CATEGORY_COLORS[place.category] || CATEGORY_COLORS.other;

            return (
              <AdvancedMarker
                key={place.id}
                position={{ lat: place.lat, lng: place.lng }}
                onClick={() => onSelectPlace(place)}
                title={place.name}
                zIndex={isSelected ? 50 : 10}
              >
                <div className="relative group cursor-pointer transition-transform duration-200 hover:scale-110">
                  <Pin
                    background={isSelected ? '#3B82F6' : style.bg}
                    borderColor={isSelected ? '#1D4ED8' : style.border}
                    glyphColor={style.glyph}
                    scale={isSelected ? 1.35 : 1.1}
                  />
                  {/* Subtle label hover pill */}
                  <div className="absolute left-1/2 -translate-x-1/2 -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/95 text-white text-[11px] font-medium px-2 py-0.5 rounded shadow-lg pointer-events-none whitespace-nowrap border border-slate-700 z-50">
                    {place.name}
                  </div>
                </div>
              </AdvancedMarker>
            );
          })}

          {/* InfoWindow for Selected Place */}
          {selectedPlace && (
            <InfoWindow
              position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
              onCloseClick={() => onSelectPlace(null)}
              pixelOffset={[0, -35]}
            >
              <div className="p-1 min-w-[240px] max-w-[300px] text-slate-900 font-sans">
                {/* Header with category tag */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {selectedPlace.category}
                  </span>
                  {selectedPlace.rating && (
                    <div className="flex items-center gap-1 text-amber-600 text-xs font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{selectedPlace.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Place Name */}
                <h4 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                  {selectedPlace.name}
                </h4>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed mb-2 line-clamp-3">
                  {selectedPlace.description}
                </p>

                {/* Address */}
                {selectedPlace.address && (
                  <div className="flex items-start gap-1 text-[11px] text-slate-500 mb-3">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{selectedPlace.address}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-1.5 pt-1.5 border-t border-slate-100">
                  <button
                    onClick={() => onAskAboutPlace(selectedPlace)}
                    className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Ask GeoChat about this spot</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                      title="Get Directions in Google Maps Web"
                    >
                      <Navigation2 className="w-3 h-3 text-blue-500" />
                      <span>Directions</span>
                    </a>

                    <a
                      href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${selectedPlace.lat},${selectedPlace.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                      title="Open Street View Web"
                    >
                      <Eye className="w-3 h-3 text-amber-500" />
                      <span>Street View</span>
                    </a>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${selectedPlace.name} ${selectedPlace.address || ''}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                      title="Open in Google Maps Web"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>

      {/* Bottom Floating Info Strip */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
        <button
          onClick={onOpenLocationPicker}
          title="Click to choose a new location, use GPS, or explore the whole world"
          className="flex items-center gap-2 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 hover:border-blue-500 rounded-xl px-3 py-1.5 text-xs text-slate-200 shadow-xl pointer-events-auto transition-colors cursor-pointer group"
        >
          <MapPin className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-white truncate max-w-[200px] sm:max-w-xs">
            {viewport.locationName || 'Exploring Region'}
          </span>
          <span className="text-slate-500 text-[10px]">
            {viewport.center.lat.toFixed(4)}, {viewport.center.lng.toFixed(4)}
          </span>
          {onOpenLocationPicker && (
            <span className="text-[10px] text-blue-400 font-semibold underline ml-0.5">
              Change
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
