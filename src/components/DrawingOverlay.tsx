import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Polyline,
  Polygon,
  AdvancedMarker,
  useMapsLibrary,
  MapControl,
  ControlPosition,
} from '@vis.gl/react-google-maps';
import {
  Ruler,
  Hexagon,
  MousePointer,
  RotateCcw,
  RotateCw,
  Trash2,
  Sparkles,
  X,
  Footprints,
  Check,
  HelpCircle,
  FileText,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { DrawingMode, LatLngPoint, DrawingMeasurement, MeasurementUnit } from '../types.ts';
import { MeasurementHelpModal } from './MeasurementHelpModal.tsx';
import { MeasurementResultModal } from './MeasurementResultModal.tsx';

interface DrawingOverlayProps {
  mode: DrawingMode;
  onModeChange: (mode: DrawingMode) => void;
  points: LatLngPoint[];
  onPointsChange: (points: LatLngPoint[]) => void;
  onAskAboutDrawing: (measurement: DrawingMeasurement) => void;
}

// Haversine formula calculation for distance in meters
export function calculateDistance(p1: LatLngPoint, p2: LatLngPoint): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLon = ((p2.lng - p1.lng) * Math.PI) / 180;
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate total path distance
export function calculateTotalPathDistance(points: LatLngPoint[]): number {
  if (points.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += calculateDistance(points[i], points[i + 1]);
  }
  return total;
}

// Spherical polygon area calculation in square meters
export function calculatePolygonArea(points: LatLngPoint[]): number {
  if (points.length < 3) return 0;
  const R = 6371000;
  let total = 0;
  const len = points.length;

  for (let i = 0; i < len; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % len];
    const lat1 = (p1.lat * Math.PI) / 180;
    const lat2 = (p2.lat * Math.PI) / 180;
    const dLon = ((p2.lng - p1.lng) * Math.PI) / 180;
    total += dLon * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  total = (total * R * R) / 2.0;
  return Math.abs(total);
}

export const DrawingOverlay: React.FC<DrawingOverlayProps> = ({
  mode,
  onModeChange,
  points,
  onPointsChange,
  onAskAboutDrawing,
}) => {
  const geometryLib = useMapsLibrary('geometry');

  // Measurement unit state (metric, imperial, nautical)
  const [unit, setUnit] = useState<MeasurementUnit>('metric');

  // History stacks for multi-step Undo & Redo
  const [undoStack, setUndoStack] = useState<LatLngPoint[][]>([]);
  const [redoStack, setRedoStack] = useState<LatLngPoint[][]>([]);
  const lastPointsRef = useRef<LatLngPoint[]>(points);

  // Dialog states
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  // Track changes to update undo stack when user adds points from map clicks
  useEffect(() => {
    if (points !== lastPointsRef.current) {
      if (lastPointsRef.current.length !== points.length) {
        // Points were added or modified outside of undo/redo buttons
        setUndoStack((prev) => [...prev, lastPointsRef.current]);
        setRedoStack([]);
      }
      lastPointsRef.current = points;
    }
  }, [points]);

  // Calculate live measurements
  const totalDistance = useMemo(() => {
    if (points.length < 2) return 0;
    const gmaps = (window as any).google;
    if (geometryLib?.spherical && gmaps?.maps) {
      try {
        const latLngs = points.map((p) => new gmaps.maps.LatLng(p.lat, p.lng));
        return geometryLib.spherical.computeLength(latLngs);
      } catch {
        return calculateTotalPathDistance(points);
      }
    }
    return calculateTotalPathDistance(points);
  }, [points, geometryLib]);

  const totalArea = useMemo(() => {
    if ((mode !== 'polygon' && mode !== 'none') || points.length < 3) return 0;
    const gmaps = (window as any).google;
    if (geometryLib?.spherical && gmaps?.maps) {
      try {
        const latLngs = points.map((p) => new gmaps.maps.LatLng(p.lat, p.lng));
        return geometryLib.spherical.computeArea(latLngs);
      } catch {
        return calculatePolygonArea(points);
      }
    }
    return calculatePolygonArea(points);
  }, [mode, points, geometryLib]);

  // Estimated walking time (at 4.8 km/h ~ 80 meters/min)
  const walkingMinutes = Math.round(totalDistance / 80);

  // Unit formatting helpers
  const formatDist = (meters: number) => {
    if (unit === 'imperial') {
      if (meters < 1609.34) {
        return `${Math.round(meters * 3.28084).toLocaleString()} ft`;
      }
      return `${(meters * 0.000621371).toFixed(2)} mi`;
    }
    if (unit === 'nautical') {
      return `${(meters / 1852).toFixed(2)} nm`;
    }
    // Metric
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };

  const formatArea = (sqM: number) => {
    if (unit === 'imperial') {
      if (sqM < 4046.86) {
        return `${Math.round(sqM * 10.7639).toLocaleString()} sq ft`;
      }
      return `${(sqM * 0.000247105).toFixed(2)} acres`;
    }
    if (unit === 'nautical') {
      return `${(sqM / 3429904).toFixed(3)} sq nm`;
    }
    // Metric
    if (sqM < 10000) {
      return `${Math.round(sqM).toLocaleString()} m²`;
    }
    return `${(sqM / 1000000).toFixed(3)} km²`;
  };

  // Undo Action
  const handleUndo = () => {
    if (undoStack.length === 0 && points.length === 0) return;
    if (undoStack.length > 0) {
      const prevPoints = undoStack[undoStack.length - 1];
      setRedoStack((prev) => [...prev, points]);
      setUndoStack((prev) => prev.slice(0, -1));
      lastPointsRef.current = prevPoints;
      onPointsChange(prevPoints);
    } else {
      // Fallback single point undo
      setRedoStack((prev) => [...prev, points]);
      const prevPoints = points.slice(0, -1);
      lastPointsRef.current = prevPoints;
      onPointsChange(prevPoints);
    }
  };

  // Redo Action
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextPoints = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, points]);
    setRedoStack((prev) => prev.slice(0, -1));
    lastPointsRef.current = nextPoints;
    onPointsChange(nextPoints);
  };

  // Clear Action with Confirmation
  const handleRequestClear = () => {
    if (points.length === 0) return;
    setIsClearConfirmOpen(true);
  };

  const handleConfirmClear = () => {
    setUndoStack((prev) => [...prev, points]);
    setRedoStack([]);
    lastPointsRef.current = [];
    onPointsChange([]);
    setIsClearConfirmOpen(false);
  };

  // Done Action: finalize and preserve measurement without deleting
  const handleDone = () => {
    onModeChange('none');
  };

  const handleRemovePoint = (indexToRemove: number) => {
    setUndoStack((prev) => [...prev, points]);
    setRedoStack([]);
    const updated = points.filter((_, idx) => idx !== indexToRemove);
    lastPointsRef.current = updated;
    onPointsChange(updated);
    setSelectedPointIndex(null);
  };

  const handleAskAI = () => {
    onAskAboutDrawing({
      mode,
      points,
      totalDistanceMeters: totalDistance,
      totalAreaSquareMeters: totalArea,
    });
  };

  // Segments for distance labels
  const segments = useMemo(() => {
    if (points.length < 2 || mode === 'polygon') return [];
    const list: {
      midLat: number;
      midLng: number;
      distanceMeters: number;
      label: string;
      index: number;
    }[] = [];

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const dist = calculateDistance(p1, p2);
      list.push({
        midLat: (p1.lat + p2.lat) / 2,
        midLng: (p1.lng + p2.lng) / 2,
        distanceMeters: dist,
        label: formatDist(dist),
        index: i,
      });
    }
    return list;
  }, [points, mode, unit]);

  // Determine whether to show the polyline/polygon
  const showDistancePath = (mode === 'distance' || mode === 'none') && points.length >= 2;
  const showPolygon = (mode === 'polygon' || mode === 'none') && points.length >= 3;

  return (
    <>
      {/* 1. Map Geometries Rendering */}
      {/* Distance Polyline */}
      {showDistancePath && (
        <Polyline
          path={points}
          strokeColor="#06B6D4" // Cyan-500
          strokeOpacity={0.95}
          strokeWeight={4}
          geodesic={true}
        />
      )}

      {/* Polygon Area Fill & Outline */}
      {showPolygon && (
        <Polygon
          paths={points}
          strokeColor="#3B82F6" // Blue-500
          strokeOpacity={0.9}
          strokeWeight={3}
          fillColor="#3B82F6"
          fillOpacity={0.25}
          geodesic={true}
        />
      )}

      {/* Polygon Temporary Connecting Polyline if only 2 points */}
      {mode === 'polygon' && points.length === 2 && (
        <Polyline
          path={points}
          strokeColor="#3B82F6"
          strokeOpacity={0.8}
          strokeWeight={3}
          geodesic={true}
        />
      )}

      {/* Segment Distance Badges (Measurement Labels) */}
      {segments.map((seg) => (
        <AdvancedMarker
          key={`segment-${seg.index}-${seg.midLat}-${seg.midLng}`}
          position={{ lat: seg.midLat, lng: seg.midLng }}
          zIndex={150}
        >
          <div className="bg-slate-900/95 text-cyan-300 border border-cyan-500/50 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-md whitespace-nowrap pointer-events-none -translate-x-1/2 -translate-y-1/2">
            {seg.label}
          </div>
        </AdvancedMarker>
      ))}

      {/* Vertex Waypoint Markers */}
      {points.map((point, index) => {
        const isFirst = index === 0;
        const isLast = index === points.length - 1;

        return (
          <AdvancedMarker
            key={`point-${index}-${point.lat}-${point.lng}`}
            position={{ lat: point.lat, lng: point.lng }}
            zIndex={200 + index}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (mode !== 'none') {
                  setSelectedPointIndex(selectedPointIndex === index ? null : index);
                }
              }}
              title={`Waypoint #${index + 1}: Click to delete or inspect`}
              className="relative group cursor-pointer -translate-x-1/2 -translate-y-1/2"
            >
              <div
                className={`w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-bold text-white transition-all duration-150 hover:scale-125 ${
                  mode === 'distance'
                    ? isFirst
                      ? 'bg-emerald-500 ring-2 ring-emerald-300'
                      : isLast
                      ? 'bg-cyan-500 ring-2 ring-cyan-300'
                      : 'bg-slate-700'
                    : isFirst
                    ? 'bg-blue-600 ring-2 ring-blue-300'
                    : 'bg-indigo-600'
                }`}
              >
                {index + 1}
              </div>

              {/* Waypoint Click Popover (Delete or Inspect) */}
              {selectedPointIndex === index && mode !== 'none' && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-1/2 -translate-x-1/2 -top-12 bg-slate-900 border border-rose-500/80 rounded-xl p-1.5 shadow-2xl flex items-center gap-1.5 whitespace-nowrap z-50 text-[11px]"
                >
                  <span className="text-slate-300 text-[10px] pl-1">Point #{index + 1}</span>
                  <button
                    onClick={() => handleRemovePoint(index)}
                    className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition-colors"
                  >
                    Delete Point
                  </button>
                  <button
                    onClick={() => setSelectedPointIndex(null)}
                    className="p-0.5 text-slate-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </AdvancedMarker>
        );
      })}

      {/* 2. MapControl Floating Drawing Toolbar & HUD */}
      <MapControl position={ControlPosition.TOP_CENTER}>
        <div className="mt-16 flex flex-col items-center gap-2 pointer-events-auto select-none max-w-[95vw]">
          {/* Main Professional Toolbar */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-slate-900/95 backdrop-blur-md border border-blue-500/35 rounded-2xl shadow-2xl shadow-blue-950/70">
            {/* Mode: Pan / Explore */}
            <button
              onClick={() => onModeChange('none')}
              title="Pan & Explore Map without drawing"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                mode === 'none'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-600'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Explore</span>
            </button>

            {/* Mode: Measure Distance */}
            <button
              onClick={() => onModeChange('distance')}
              title="Click map points to measure path distance"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                mode === 'distance'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40 border border-cyan-400'
                  : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60'
              }`}
            >
              <Ruler className="w-3.5 h-3.5 text-cyan-400" />
              <span>Measure Distance</span>
              {mode === 'distance' && points.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-200 text-[10px] flex items-center justify-center font-bold">
                  {points.length}
                </span>
              )}
            </button>

            {/* Mode: Draw Area */}
            <button
              onClick={() => onModeChange('polygon')}
              title="Click map points to enclose a polygon area"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                mode === 'polygon'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 border border-blue-400'
                  : 'text-slate-300 hover:text-blue-300 hover:bg-slate-800/60'
              }`}
            >
              <Hexagon className="w-3.5 h-3.5 text-blue-400" />
              <span>Draw Area</span>
              {mode === 'polygon' && points.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-950 text-blue-200 text-[10px] flex items-center justify-center font-bold">
                  {points.length}
                </span>
              )}
            </button>

            <div className="w-[1px] h-5 bg-blue-800/40 mx-0.5 hidden sm:block" />

            {/* Undo Button */}
            <button
              onClick={handleUndo}
              disabled={points.length === 0}
              title="Undo most recent point (Ctrl+Z)"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                points.length > 0
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 cursor-not-allowed opacity-50'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Undo</span>
            </button>

            {/* Redo Button */}
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              title="Redo undone action"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                redoStack.length > 0
                  ? 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800'
                  : 'text-slate-600 cursor-not-allowed opacity-50'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Redo</span>
            </button>

            {/* Done Button (Confirm / Finish session without losing work) */}
            {mode !== 'none' && points.length >= 2 && (
              <button
                onClick={handleDone}
                title="Finish measurement and preserve completed shape on map"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Done</span>
              </button>
            )}

            {/* Clear Button (Destructive with Confirmation) */}
            {points.length > 0 && (
              <button
                onClick={handleRequestClear}
                title="Clear all points from map"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Clear</span>
              </button>
            )}

            {/* Units Toggle Button */}
            <button
              onClick={() =>
                setUnit((u) =>
                  u === 'metric' ? 'imperial' : u === 'imperial' ? 'nautical' : 'metric'
                )
              }
              title={`Measurement Unit: ${unit.toUpperCase()} (Click to toggle)`}
              className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-blue-500/30 text-cyan-300 text-[11px] font-bold uppercase transition-colors cursor-pointer"
            >
              {unit}
            </button>

            {/* Results / Export Button */}
            {points.length >= 2 && (
              <button
                onClick={() => setIsResultOpen(true)}
                title="View full measurement summary & export GeoJSON/Text"
                className="p-1.5 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Ask / Help Button */}
            <button
              onClick={() => setIsHelpOpen(true)}
              title="Measurement Help, Guide, & FAQs"
              className="p-1.5 text-slate-300 hover:text-blue-300 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>

            {/* Exit Drawing Mode */}
            {mode !== 'none' && (
              <button
                onClick={() => onModeChange('none')}
                title="Exit drawing mode"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 3. Live HUD Display Strip */}
          {(mode !== 'none' || points.length >= 2) && (
            <div className="flex flex-wrap items-center justify-center gap-3 px-3.5 py-2 bg-slate-900/95 backdrop-blur-md border border-blue-500/30 rounded-xl shadow-2xl text-xs animate-fade-in text-slate-200">
              {/* Distance HUD */}
              {(mode === 'distance' || (mode === 'none' && totalArea === 0 && points.length >= 2)) && (
                <>
                  <div className="flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-slate-400">Total Distance:</span>
                    <span className="font-bold text-white text-sm">
                      {points.length >= 2 ? formatDist(totalDistance) : 'Click map to place waypoints'}
                    </span>
                  </div>

                  {points.length >= 2 && (
                    <>
                      <div className="w-[1px] h-4 bg-blue-800/40" />
                      <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                        <Footprints className="w-3 h-3 text-emerald-400" />
                        <span>~{walkingMinutes} min walk</span>
                      </div>

                      <button
                        onClick={handleAskAI}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-[11px] shadow-sm transition-colors cursor-pointer ml-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Ask AI About Route</span>
                      </button>

                      <button
                        onClick={() => setIsResultOpen(true)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-200 text-[11px] font-medium border border-blue-500/30 transition-colors cursor-pointer"
                      >
                        <span>Summary</span>
                      </button>
                    </>
                  )}
                </>
              )}

              {/* Polygon HUD */}
              {(mode === 'polygon' || (mode === 'none' && totalArea > 0)) && (
                <>
                  <div className="flex items-center gap-1.5">
                    <Hexagon className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-slate-400">Enclosed Area:</span>
                    <span className="font-bold text-white text-sm">
                      {points.length >= 3 ? formatArea(totalArea) : `${points.length} of 3+ corners added`}
                    </span>
                  </div>

                  {points.length >= 3 && (
                    <>
                      <div className="w-[1px] h-4 bg-blue-800/40" />
                      <div className="text-slate-400 text-[11px]">
                        Perimeter: {formatDist(calculateTotalPathDistance([...points, points[0]]))}
                      </div>

                      <button
                        onClick={handleAskAI}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] shadow-sm transition-colors cursor-pointer ml-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Ask AI About Area</span>
                      </button>

                      <button
                        onClick={() => setIsResultOpen(true)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-200 text-[11px] font-medium border border-blue-500/30 transition-colors cursor-pointer"
                      >
                        <span>Summary</span>
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </MapControl>

      {/* Confirmation Dialog for Destructive Clear Action */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in select-text">
          <div className="fixed inset-0" onClick={() => setIsClearConfirmOpen(false)} />
          <div className="relative w-full max-w-sm bg-slate-900 border border-rose-500/40 rounded-2xl p-5 shadow-2xl z-10 space-y-3">
            <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm">
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <span>Clear Measurement?</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to clear this measurement? All <strong>{points.length} waypoints</strong> ({formatDist(totalDistance)}) will be permanently erased.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsClearConfirmOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClear}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950/40 transition-colors cursor-pointer"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Measurement Help & Assistant Modal */}
      <MeasurementHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onAskAI={handleAskAI}
        hasActiveMeasurement={points.length >= 2}
      />

      {/* Result Summary & GeoJSON Export Modal */}
      <MeasurementResultModal
        isOpen={isResultOpen}
        onClose={() => setIsResultOpen(false)}
        mode={mode}
        points={points}
        totalDistanceMeters={totalDistance}
        totalAreaSquareMeters={totalArea}
        unit={unit}
        onAskAI={handleAskAI}
      />
    </>
  );
};
