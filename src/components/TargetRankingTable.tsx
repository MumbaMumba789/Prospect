import React, { useState, useMemo } from 'react';
import { EvaluatedTarget, PriorityCategory, ScoringWeights } from '../types';
import { exportTargetsToCSV, getPriorityStyling } from '../utils/scoring';
import {
  Search,
  ArrowUpDown,
  Download,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  GitCompare,
} from 'lucide-react';

interface TargetRankingTableProps {
  targets: EvaluatedTarget[];
  selectedTargetId: string | null;
  onSelectTarget: (id: string) => void;
  onCompareTarget: (target: EvaluatedTarget) => void;
  weights: ScoringWeights;
}

type SortField = 'rank' | 'score' | 'id' | 'completeness';
type SortOrder = 'asc' | 'desc';

export const TargetRankingTable: React.FC<TargetRankingTableProps> = ({
  targets,
  selectedTargetId,
  onSelectTarget,
  onCompareTarget,
  weights,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'All' | PriorityCategory>('All');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const filteredAndSortedTargets = useMemo(() => {
    return targets
      .filter((target) => {
        const matchesSearch =
          target.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          target.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          target.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
          target.hostLithology.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesPriority =
          priorityFilter === 'All' || target.priorityCategory === priorityFilter;

        return matchesSearch && matchesPriority;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === 'rank') {
          comparison = a.rank - b.rank;
        } else if (sortField === 'score') {
          comparison = b.totalScore - a.totalScore;
        } else if (sortField === 'id') {
          comparison = a.id.localeCompare(b.id);
        } else if (sortField === 'completeness') {
          comparison = b.dataQuality.completenessScore - a.dataQuality.completenessScore;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [targets, searchTerm, priorityFilter, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'rank' ? 'asc' : 'desc');
    }
  };

  const handleExportCSV = () => {
    exportTargetsToCSV(filteredAndSortedTargets, weights);
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col shadow-xs">
      {/* Table Toolbar */}
      <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-800">
            Target Rankings ({filteredAndSortedTargets.length} of {targets.length})
          </span>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search targets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-200 rounded pl-8 pr-3 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 w-48 shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                &times;
              </button>
            )}
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded border border-slate-200">
            <button
              onClick={() => setPriorityFilter('All')}
              className={`px-2 py-0.5 text-[11px] rounded transition-colors cursor-pointer ${
                priorityFilter === 'All'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setPriorityFilter('High Priority')}
              className={`px-2 py-0.5 text-[11px] rounded transition-colors cursor-pointer ${
                priorityFilter === 'High Priority'
                  ? 'bg-white text-[#c25e1a] font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              High
            </button>
            <button
              onClick={() => setPriorityFilter('Moderate Priority')}
              className={`px-2 py-0.5 text-[11px] rounded transition-colors cursor-pointer ${
                priorityFilter === 'Moderate Priority'
                  ? 'bg-white text-slate-800 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Moderate
            </button>
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Data Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
            <tr>
              <th
                onClick={() => toggleSort('rank')}
                className="py-2 px-3 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Rank</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('id')}
                className="py-2 px-3 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Target ID</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2 px-3">Target Name & District</th>
              <th className="py-2 px-3">Category</th>
              <th
                onClick={() => toggleSort('score')}
                className="py-2 px-3 cursor-pointer hover:text-slate-900 transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Score (0–100)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2 px-3">Host Lithology & Setting</th>
              <th
                onClick={() => toggleSort('completeness')}
                className="py-2 px-3 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Data Quality</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[11px]">
            {filteredAndSortedTargets.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No targets match criteria.
                </td>
              </tr>
            ) : (
              filteredAndSortedTargets.map((target) => {
                const isSelected = target.id === selectedTargetId;
                const styling = getPriorityStyling(target.priorityCategory);

                return (
                  <tr
                    key={target.id}
                    onClick={() => onSelectTarget(target.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-amber-50/70 border-l-2 border-l-[#c25e1a]'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono text-slate-500 font-semibold">
                      #{target.rank}
                    </td>

                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {target.id}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{target.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {target.district} · {target.province}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${styling.badgeBg} ${styling.borderColor} ${styling.textColor}`}
                      >
                        {target.priorityCategory}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold text-xs tabular-nums text-slate-900">
                      <span style={{ color: styling.hexColor }}>{target.totalScore.toFixed(1)}</span>
                    </td>

                    <td className="py-2.5 px-3 max-w-[220px]">
                      <div className="truncate text-slate-800" title={target.hostLithology}>
                        {target.hostLithology}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate" title={target.structuralSetting}>
                        {target.structuralSetting}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-slate-700">{target.dataQuality.completenessScore}%</span>
                        {target.dataQuality.missingData.length > 0 ? (
                          <span
                            title={`Missing: ${target.dataQuality.missingData.join(', ')}`}
                            className="text-amber-700 text-[10px] flex items-center gap-0.5 font-medium"
                          >
                            <AlertCircle className="w-3 h-3" />
                            <span>{target.dataQuality.missingData.length} gaps</span>
                          </span>
                        ) : (
                          <span className="text-emerald-700 text-[10px] flex items-center gap-0.5 font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Complete</span>
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCompareTarget(target);
                          }}
                          title="Compare target"
                          className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <GitCompare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTarget(target.id);
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
