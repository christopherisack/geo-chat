import React from 'react';
import {
  X,
  Ruler,
  Hexagon,
  HelpCircle,
  Sparkles,
  RotateCcw,
  RotateCw,
  Check,
  Download,
  Trash2,
  Globe,
  Footprints,
  Info,
} from 'lucide-react';

interface MeasurementHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskAI: () => void;
  hasActiveMeasurement: boolean;
}

export const MeasurementHelpModal: React.FC<MeasurementHelpModalProps> = ({
  isOpen,
  onClose,
  onAskAI,
  hasActiveMeasurement,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in select-text">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl max-h-[90vh] bg-gradient-to-b from-slate-900 via-slate-920 to-slate-950 border border-blue-500/35 rounded-2xl shadow-2xl shadow-blue-950/80 flex flex-col overflow-hidden z-10">
        {/* Top Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 shrink-0" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-blue-900/30 flex items-center justify-between bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-cyan-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-1.5">
                Measurement Tool Guide & Help
              </h3>
              <p className="text-[11px] text-blue-200">
                Learn how to measure distances, draw areas, and analyze results
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Close help dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-slate-200 text-xs leading-relaxed">
          {/* Ask AI Banner (if user has active measurement) */}
          {hasActiveMeasurement && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/60 via-blue-950/60 to-indigo-950/60 border border-cyan-400/40 flex items-center justify-between gap-3 shadow-sm">
              <div>
                <span className="font-bold text-white text-xs flex items-center gap-1 mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Have active measurements on map?
                </span>
                <p className="text-[11px] text-blue-200">
                  Ask GeoChat to review your route or area, recommend sights, terrain advice, and local tips.
                </p>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onAskAI();
                }}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
              >
                Ask AI Now
              </button>
            </div>
          )}

          {/* Section 1: How to use Distance & Area */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              1. Measurement Modes
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-blue-500/20">
                <div className="flex items-center gap-1.5 font-bold text-white mb-1">
                  <Ruler className="w-4 h-4 text-cyan-400" />
                  <span>Measure Distance</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Click consecutive points on the map. The tool draws a geodesic polyline and calculates total distance, segment lengths, and estimated walking duration.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-blue-500/20">
                <div className="flex items-center gap-1.5 font-bold text-white mb-1">
                  <Hexagon className="w-4 h-4 text-blue-400" />
                  <span>Draw Area (Polygon)</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Click 3 or more corners on the map to enclose a geographical zone. Calculates spherical surface area, perimeter boundary, and center point.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Toolbar Controls */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              2. Toolbar Actions Explained
            </h4>

            <div className="space-y-2 bg-slate-900/80 border border-blue-500/20 rounded-xl p-3.5">
              <div className="flex items-start gap-2">
                <RotateCcw className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Undo:</strong> Reverses your latest waypoint placement. Supports multiple undo steps.
                </div>
              </div>

              <div className="flex items-start gap-2">
                <RotateCw className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Redo:</strong> Re-applies the most recently undone point if you change your mind.
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Done:</strong> Finishes the measurement session and exits drawing mode without losing your completed work. The shape stays preserved on the map.
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Trash2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Clear:</strong> Clears all points. Includes a safety confirmation dialog to prevent accidental data loss.
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Download className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Export & Download:</strong> Copies full measurement breakdown to clipboard or downloads a standard GeoJSON file compatible with GIS tools & Google Earth.
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Geodesic Calculation & Accuracy */}
          <div className="space-y-2 bg-blue-950/20 border border-blue-500/20 rounded-xl p-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Calculation Accuracy & Standards</span>
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Measurements use spherical geometry based on the Earth's mean radius (6,371,000 meters). When the Google Maps geometry library is active, true geodesic spherical path integrals (<code className="text-cyan-300">computeLength</code> and <code className="text-cyan-300">computeArea</code>) account for the Earth's curvature.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
              <Footprints className="w-3.5 h-3.5 text-emerald-400" />
              <span>Walking time is estimated using standard pedestrian velocity of 4.8 km/h (~80 meters/min).</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-blue-900/30 bg-slate-950 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">GeoChat Precision Measurement Tool</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
