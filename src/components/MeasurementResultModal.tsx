import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileText,
  Globe,
  Footprints,
  Ruler,
  Hexagon,
  Sparkles,
  Share2,
} from 'lucide-react';
import { LatLngPoint, DrawingMode, MeasurementUnit } from '../types.ts';

interface MeasurementResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: DrawingMode;
  points: LatLngPoint[];
  totalDistanceMeters: number;
  totalAreaSquareMeters?: number;
  unit: MeasurementUnit;
  onAskAI: () => void;
}

export const MeasurementResultModal: React.FC<MeasurementResultModalProps> = ({
  isOpen,
  onClose,
  mode,
  points,
  totalDistanceMeters,
  totalAreaSquareMeters,
  unit,
  onAskAI,
}) => {
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen || points.length === 0) return null;

  const isPolygon = mode === 'polygon' || (mode === 'none' && (totalAreaSquareMeters || 0) > 0);

  // Format helpers
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

  const walkingMinutes = Math.round(totalDistanceMeters / 80);

  // Generate GeoJSON
  const generateGeoJSON = () => {
    if (isPolygon && points.length >= 3) {
      return JSON.stringify(
        {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                type: 'PolygonArea',
                enclosedAreaSquareMeters: totalAreaSquareMeters,
                perimeterMeters: totalDistanceMeters,
                pointsCount: points.length,
                createdAt: new Date().toISOString(),
                software: 'GeoChat AI Measurement Tool',
              },
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [...points.map((p) => [p.lng, p.lat]), [points[0].lng, points[0].lat]],
                ],
              },
            },
          ],
        },
        null,
        2
      );
    }

    return JSON.stringify(
      {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              type: 'DistancePolyline',
              totalDistanceMeters: totalDistanceMeters,
              pointsCount: points.length,
              walkingMinutesEstimate: walkingMinutes,
              createdAt: new Date().toISOString(),
              software: 'GeoChat AI Measurement Tool',
            },
            geometry: {
              type: 'LineString',
              coordinates: points.map((p) => [p.lng, p.lat]),
            },
          },
        ],
      },
      null,
      2
    );
  };

  // Generate Text Report
  const generateReportText = () => {
    let report = `========================================\n`;
    report += `GEOCHAT MEASUREMENT REPORT\n`;
    report += `Date: ${new Date().toLocaleString()}\n`;
    report += `Type: ${isPolygon ? 'Enclosed Polygon Area' : 'Distance Measurement'}\n`;
    report += `Units: ${unit.toUpperCase()}\n`;
    report += `========================================\n\n`;

    if (isPolygon) {
      report += `Total Area: ${formatArea(totalAreaSquareMeters || 0)}\n`;
      report += `Perimeter Boundary: ${formatDist(totalDistanceMeters)}\n`;
    } else {
      report += `Total Distance: ${formatDist(totalDistanceMeters)}\n`;
      report += `Estimated Walking Time: ~${walkingMinutes} minutes (@ 4.8 km/h)\n`;
    }
    report += `Waypoints Count: ${points.length}\n\n`;

    report += `WAYPOINTS LIST:\n`;
    points.forEach((pt, i) => {
      report += `  #${i + 1}: ${pt.lat.toFixed(6)}, ${pt.lng.toFixed(6)}\n`;
    });

    report += `\nExported from GeoChat AI (Isack Christopher)`;
    return report;
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateReportText());
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDownloadGeoJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(generateGeoJSON());
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute(
      'download',
      `geochat_measurement_${Date.now()}.geojson`
    );
    dlAnchorElem.click();
  };

  const handleDownloadText = () => {
    const dataStr =
      'data:text/plain;charset=utf-8,' + encodeURIComponent(generateReportText());
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute(
      'download',
      `geochat_measurement_${Date.now()}.txt`
    );
    dlAnchorElem.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in select-text">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg max-h-[90vh] bg-gradient-to-b from-slate-900 via-slate-920 to-slate-950 border border-blue-500/35 rounded-2xl shadow-2xl shadow-blue-950/80 flex flex-col overflow-hidden z-10">
        {/* Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600 shrink-0" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-blue-900/30 flex items-center justify-between bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-cyan-400">
              {isPolygon ? <Hexagon className="w-5 h-5" /> : <Ruler className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Measurement Summary & Export
              </h3>
              <p className="text-[11px] text-blue-200">
                {isPolygon ? 'Polygon Area Details' : 'Path Distance Summary'} • {points.length} Waypoints
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-slate-200 text-xs">
          {/* Main Key Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-blue-500/30 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {isPolygon ? 'Enclosed Area' : 'Total Distance'}
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-white">
                {isPolygon ? formatArea(totalAreaSquareMeters || 0) : formatDist(totalDistanceMeters)}
              </span>
              <span className="text-[10px] text-cyan-300 block mt-0.5">
                {unit.toUpperCase()} format
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-blue-500/30 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {isPolygon ? 'Perimeter Boundary' : 'Est. Walking Time'}
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-white">
                {isPolygon ? formatDist(totalDistanceMeters) : `~${walkingMinutes} min`}
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5 flex items-center gap-1">
                <Footprints className="w-3 h-3" />
                <span>Pedestrian velocity</span>
              </span>
            </div>
          </div>

          {/* Waypoints List Preview */}
          <div className="bg-slate-900/80 border border-blue-500/20 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                Waypoints Coordinates ({points.length})
              </span>
              <button
                onClick={handleCopyReport}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copiedText ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedText ? 'Copied' : 'Copy All'}</span>
              </button>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1 font-mono text-[11px] text-slate-300 pr-1">
              {points.map((pt, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-0.5 px-2 rounded bg-slate-950/60"
                >
                  <span className="text-slate-500">#{i + 1}</span>
                  <span>{pt.lat.toFixed(5)}, {pt.lng.toFixed(5)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Export Actions */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Export / Download Formats
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={handleDownloadGeoJSON}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-200 hover:text-white font-semibold transition-colors cursor-pointer text-xs"
              >
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Download GeoJSON</span>
              </button>

              <button
                onClick={handleDownloadText}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-semibold transition-colors cursor-pointer text-xs"
              >
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Download Text Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-blue-900/30 bg-slate-950 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              onClose();
              onAskAI();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
            <span>Ask GeoChat AI</span>
          </button>

          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
