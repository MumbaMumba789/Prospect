import React from 'react';
import { Download, GitCompare, SlidersHorizontal, Map, Table2, BookOpen } from 'lucide-react';

interface HeaderProps {
  currentView: 'dashboard' | 'rankings' | 'methodology';
  onChangeView: (view: 'dashboard' | 'rankings' | 'methodology') => void;
  onExportCSV: () => void;
  onOpenCompare: () => void;
  onOpenWeights: () => void;
  onOpenHowItWorks: () => void;
  targetCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onChangeView,
  onExportCSV,
  onOpenCompare,
  onOpenWeights,
  onOpenHowItWorks,
  targetCount,
}) => {
  return (
    <header className="h-13 px-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 z-30 select-none shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {/* Brand & Context */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChangeView('dashboard')}
          className="flex items-center gap-2 cursor-pointer text-left focus:outline-none"
        >
          <div className="w-6 h-6 rounded bg-[#c25e1a] flex items-center justify-center text-white font-bold text-xs tracking-wide">
            P
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 tracking-tight">Prospect</span>
            <span className="hidden sm:inline text-[11px] text-slate-500 font-medium">
              Copper Exploration Intelligence
            </span>
            <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              Demo
            </span>
          </div>
        </button>
      </div>

      {/* Primary Navigation */}
      <nav className="flex items-center gap-1 bg-slate-100/80 p-0.5 rounded-md border border-slate-200/80">
        <button
          onClick={() => onChangeView('dashboard')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
            currentView === 'dashboard'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Map className="w-3.5 h-3.5 text-slate-500" />
          <span>Exploration</span>
        </button>

        <button
          onClick={() => onChangeView('rankings')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
            currentView === 'rankings'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Table2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Targets</span>
          <span className="text-[11px] text-slate-500 font-mono">({targetCount})</span>
        </button>

        <button
          onClick={() => onChangeView('methodology')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
            currentView === 'methodology'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-500" />
          <span>Methodology</span>
        </button>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenHowItWorks}
          title="Student and Judge Briefing: How Prospect Works"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200 transition-colors cursor-pointer shadow-xs"
        >
          <span className="w-3.5 h-3.5 rounded-full bg-[#c25e1a] text-white flex items-center justify-center text-[9px] font-bold">
            ?
          </span>
          <span className="hidden sm:inline">How It Works</span>
        </button>

        <button
          onClick={onOpenWeights}
          title="Adjust indicator weighting model"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-xs"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Model Weights</span>
        </button>

        <button
          onClick={onOpenCompare}
          title="Compare two targets side by side"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-xs"
        >
          <GitCompare className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden md:inline">Compare</span>
        </button>

        <button
          onClick={onExportCSV}
          title="Export target data to CSV"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-[#c25e1a] hover:bg-[#a34e15] text-white transition-colors cursor-pointer shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>
    </header>
  );
};
