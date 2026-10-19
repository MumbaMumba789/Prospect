import React from 'react';
import { X, BookOpen, Compass, CheckCircle2, AlertTriangle, ShieldCheck, Layers, HelpCircle } from 'lucide-react';

interface HowProspectWorksModalProps {
  onClose: () => void;
}

export const HowProspectWorksModal: React.FC<HowProspectWorksModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs select-none">
      <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden text-slate-800">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#c25e1a] flex items-center justify-center text-white font-bold text-xs">
              ?
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">How Prospect Works</h2>
              <p className="text-[11px] text-slate-500">
                A student & investor briefing on the mineral exploration intelligence MVP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
            title="Close briefing"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs leading-relaxed">
          {/* 1. What the user sees */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-mono font-bold">
                1
              </span>
              <span>What the user sees</span>
            </h3>
            <p className="text-slate-600 pl-6.5">
              Prospect displays an interactive <strong>Geographic Information System (GIS)</strong> map of the Zambian Copperbelt and North-Western Province. On the map are:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-6.5 text-[11px]">
              <li>
                <strong>10 Demonstration Targets (ZM-CB-001 to ZM-CB-010):</strong> Numbered circular pins colored by priority (Copper-orange for High, Slate for Moderate, Light grey for Low).
              </li>
              <li>
                <strong>8 Reference Mines:</strong> Real operating and historical deposits (e.g. Nchanga, Konkola, Kansanshi, Mufulira, Lumwana, Sentinel) displayed as emerald diamonds for spatial context.
              </li>
              <li>
                <strong>Geological Fairways:</strong> Stylized polygons of the Lower Roan sedimentary rocks (the primary host for Copperbelt copper) and basement dome inliers.
              </li>
            </ul>
          </div>

          {/* 2. What the scoring model does */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-mono font-bold">
                2
              </span>
              <span>What the scoring model does</span>
            </h3>
            <p className="text-slate-600 pl-6.5">
              The platform implements a transparent <strong>Multi-Criteria Evaluation (MCE)</strong> model. Instead of relying on an opaque &ldquo;black-box&rdquo; AI, Prospect evaluates each target against four essential mineral system criteria on a 0 to 100 scale:
            </p>
            <div className="pl-6.5 grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-800">Geological Setting (Host Rock):</span> Evaluates if rocks belong to fertile formations (e.g. Lower Roan Ore Shale vs granite basement).
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-800">Geochemical Anomaly:</span> Measures surface soil and stream sediment copper/cobalt concentration (ppm) above baseline.
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-800">Structural Trap:</span> Checks proximity to fold hinges, faults, and shear zones where mineralizing fluids concentrate.
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-800">Deposit Proximity:</span> Distance to known economic orebodies along geological strike.
              </div>
            </div>
            <div className="pl-6.5 pt-1 text-[11px] text-slate-500 font-mono">
              Formula: Total Score = (w₁·s₁ + w₂·s₂ + w₃·s₃ + w₄·s₄) ÷ 100 (where weights sum to 100%).
            </div>
          </div>

          {/* 3. What the score means */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center text-[10px] font-mono font-bold">
                3
              </span>
              <span>What the score means</span>
            </h3>
            <p className="text-slate-600 pl-6.5">
              A high score (e.g. <strong>82.4 / 100</strong>) means that the available exploration indicators <strong>coincide favorably</strong> according to the current weights. It signifies that this location has strong geological rationale to deserve early-stage budget allocation and priority field inspection over lower-ranked concessions.
            </p>
          </div>

          {/* 4. What the score does NOT mean */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center text-[10px] font-mono font-bold">
                4
              </span>
              <span>What the score does NOT mean</span>
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-6.5 text-[11px]">
              <li>
                <strong>It does NOT prove copper exists at that site.</strong> Surface indicators can result from transported anomaly cover, weathered barren ironstones, or unmineralized faults.
              </li>
              <li>
                <strong>It is NOT a probability percentage.</strong> An 82 score does not mean &ldquo;82% chance of finding a mine&rdquo;.
              </li>
              <li>
                <strong>It does not replace drilling or resource estimation.</strong>
              </li>
            </ul>
          </div>

          {/* 5. What geological validation is still required */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-mono font-bold">
                5
              </span>
              <span>What geological validation is still required</span>
            </h3>
            <p className="text-slate-600 pl-6.5">
              To turn an indicative prospect into an actual discovery, exploration teams must perform:
            </p>
            <ol className="list-decimal list-inside space-y-0.5 text-slate-600 pl-6.5 text-[11px]">
              <li><strong>Field Ground Truthing:</strong> Inspecting rock outcrops and confirming mapped lithology.</li>
              <li><strong>In-Fill Soil Geochemistry:</strong> Tightening soil sampling to a 100m grid using portable X-Ray Fluorescence (pXRF).</li>
              <li><strong>Ground Geophysics:</strong> Induced Polarization (IP) to detect conductive copper sulfide bodies at depth.</li>
              <li><strong>Core Drilling:</strong> Diamond core drilling through unweathered bedrock to establish true ore thickness and grade.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 px-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500">Mine-Tech Pre-Incubation MVP</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-[#c25e1a] hover:bg-[#a34e15] text-white font-semibold rounded transition-colors cursor-pointer shadow-xs"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
