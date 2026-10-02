import React from 'react';
import { CloudServer, DecisionStep } from '../types';
import { Network, ArrowDown, Activity, Sparkles, Check, X, ShieldAlert } from 'lucide-react';

interface CloudControlVisualizationProps {
  servers: CloudServer[];
  currentStep: DecisionStep | null;
  isEvaluating: boolean;
  selectedServerId?: string;
}

export const CloudControlVisualization: React.FC<CloudControlVisualizationProps> = ({
  servers,
  currentStep,
  isEvaluating,
  selectedServerId,
}) => {
  const currentTask = currentStep?.task;

  return (
    <div className="relative rounded-2xl border border-slate-800/80 bg-gradient-to-b from-[#0B0F19] to-[#070A10] p-6 shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      {/* Header Info */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="text-xs font-mono font-semibold tracking-wider uppercase text-cyan-400">
            Cloud Control Topology Dispatcher
          </h3>
        </div>
        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-3">
          <span>Active Nodes: <strong className="text-white">{servers.filter(s => s.status !== 'OFFLINE').length}</strong></span>
          <span>•</span>
          <span>Total Capacity: <strong className="text-cyan-400">{servers.reduce((a, b) => a + (b.status !== 'OFFLINE' ? b.capacity : 0), 0)}</strong> units</span>
        </div>
      </div>

      {/* Central Cloud Dispatcher Node */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-2 pb-6">
        <div
          className={`relative px-6 py-3.5 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${
            currentTask
              ? 'bg-[#0E172B] border-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.3)] ring-2 ring-cyan-500/30'
              : 'bg-slate-900/90 border-slate-700/80'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Network className="w-6 h-6 animate-pulse" />
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-1.5">
              <span>CLOUD CONTROL CENTER</span>
              {currentTask && <span className="px-1.5 py-0.2 bg-cyan-500/20 rounded text-[9px]">DISPATCHING</span>}
            </div>

            {currentTask ? (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-semibold text-white truncate max-w-xs">{currentTask.name}</span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-700/60 rounded">
                  {currentTask.workload} units
                </span>
              </div>
            ) : (
              <div className="text-xs text-slate-400 mt-0.5">
                Idle — Waiting for simulation trigger or incoming task batch
              </div>
            )}
          </div>
        </div>

        {/* Pulse packet down */}
        <div className="h-6 w-0.5 bg-gradient-to-b from-cyan-400 to-slate-700 relative">
          {currentTask && (
            <div className="absolute -left-1 w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#22d3ee] animate-bounce" />
          )}
        </div>
      </div>

      {/* SVG Connecting Distribution Beams */}
      <div className="relative z-0 hidden md:block w-full h-12 -mt-4 mb-2">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 50">
          {/* Main distribution bus */}
          <line x1="100" y1="10" x2="900" y2="10" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          
          {/* Vertical drop to each server */}
          {servers.map((s, idx) => {
            const x = (1000 / (servers.length + 1)) * (idx + 1);
            const isTarget = s.id === selectedServerId;
            const evalItem = currentStep?.evaluations.find(e => e.serverId === s.id);
            const isFeasible = evalItem?.feasible;
            const isRejected = evalItem?.status === 'Rejected' || s.status === 'OFFLINE';

            let strokeColor = '#334155';
            let strokeWidth = 1.5;
            let strokeDash = '4 4';

            if (isTarget) {
              strokeColor = '#06B6D4';
              strokeWidth = 3;
              strokeDash = 'none';
            } else if (isFeasible) {
              strokeColor = '#10B981';
              strokeWidth = 2;
            } else if (isRejected) {
              strokeColor = '#F43F5E';
              strokeWidth = 1.5;
            }

            return (
              <g key={s.id}>
                <line x1={x} y1="10" x2={x} y2="50" stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={strokeDash} />
                {isTarget && (
                  <circle cx={x} cy="30" r="4" fill="#22D3EE" className="animate-ping" />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Server Infrastructure Node Row */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {servers.map((server) => {
          const isSelected = server.id === selectedServerId;
          const evalItem = currentStep?.evaluations.find(e => e.serverId === server.id);
          const isRejected = evalItem?.status === 'Rejected';
          const isOffline = server.status === 'OFFLINE';
          const util = server.capacity > 0 ? Math.round((server.currentLoad / server.capacity) * 100) : 0;

          return (
            <div
              key={server.id}
              className={`rounded-xl border p-3.5 transition-all duration-300 relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#0E192D] border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-[1.03] ring-2 ring-cyan-500/40'
                  : isRejected
                  ? 'bg-slate-900/60 border-rose-900/50 opacity-70'
                  : isOffline
                  ? 'bg-slate-950/60 border-slate-800 opacity-50'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-white font-display truncate">{server.name.split(' ')[0]}</span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-cyan-300 bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-500/50">
                      <Check className="w-2.5 h-2.5" /> CHOSEN
                    </span>
                  )}
                  {isRejected && (
                    <span className="flex items-center gap-1 text-[9px] font-mono text-rose-300 bg-rose-950/80 px-1.5 py-0.2 rounded border border-rose-800">
                      <X className="w-2.5 h-2.5" /> REJECTED
                    </span>
                  )}
                </div>

                <div className="text-[10px] font-mono text-slate-400 mb-2 truncate">
                  {server.region}
                </div>

                {/* Utilization meter */}
                <div className="space-y-1 mb-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Load</span>
                    <span className={util > 85 ? 'text-rose-400 font-bold' : util > 65 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {util}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${
                        util > 85 ? 'bg-rose-500' : util > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, util)}%` }}
                    />
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-400 flex justify-between">
                  <span>{server.currentLoad} / {server.capacity} u</span>
                  <span className="text-slate-300">{server.capacity - server.currentLoad} free</span>
                </div>
              </div>

              {/* Tasks tag in server */}
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400">Tasks:</span>
                <span className="px-1.5 py-0.2 bg-slate-800 text-cyan-300 font-bold rounded">
                  {server.assignedTaskIds.length} queued
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
