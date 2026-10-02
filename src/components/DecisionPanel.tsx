import React from 'react';
import { DecisionStep } from '../types';
import { CheckCircle2, XCircle, AlertTriangle, Cpu, ArrowDown, Sparkles } from 'lucide-react';

interface DecisionPanelProps {
  currentStep: DecisionStep | null;
  isEvaluating?: boolean;
}

export const DecisionPanel: React.FC<DecisionPanelProps> = ({ currentStep, isEvaluating }) => {
  if (!currentStep) {
    return (
      <div className="h-full rounded-xl border border-slate-800/80 bg-[#0C101A]/90 p-5 backdrop-blur-md flex flex-col justify-center items-center text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
          <Cpu className="w-6 h-6 animate-pulse" />
        </div>
        <h4 className="text-sm font-semibold text-slate-300 mb-1">DAA Greedy Decision Engine</h4>
        <p className="text-xs text-slate-500 max-w-xs">
          Click <span className="text-cyan-400 font-mono font-medium">"RUN LIVE SIMULATION"</span> or <span className="text-cyan-400 font-mono font-medium">"Step Forward"</span> to trace the algorithm's real-time server evaluations and assignment decisions.
        </p>
      </div>
    );
  }

  const { task, evaluations, selectedServerName, decisionType, decisionSummary, timestamp } = currentStep;

  return (
    <div className="rounded-xl border border-cyan-500/30 bg-[#0C101A]/95 p-5 shadow-[0_0_25px_rgba(6,182,212,0.08)] backdrop-blur-md flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-cyan-400">
            Algorithmic Decision Trace (Step #{currentStep.stepNumber})
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          {new Date(timestamp).toLocaleTimeString()}
        </span>
      </div>

      {/* Task Arrived Section */}
      <div className="mb-4 bg-slate-900/60 rounded-lg p-3 border border-slate-800">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-medium mb-1">
          TASK ARRIVED
        </div>
        <div className="h-px bg-slate-800 my-1.5" />
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <span>{task.name}</span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/60">
                {task.id}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Arrival Time: <span className="font-mono text-slate-300">{task.arrivalTime}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-mono text-slate-400">Workload</div>
            <div className="text-base font-bold font-mono text-amber-400">
              {task.workload} <span className="text-xs font-normal text-slate-400">units</span>
            </div>
          </div>
        </div>
      </div>

      {/* Server Evaluation Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            SERVER EVALUATION ({evaluations.length} Nodes Scanned)
          </span>
          <span className="text-[10px] font-mono text-slate-500">DAA Feasibility Check</span>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {evaluations.map((ev) => {
            const isSelected = ev.isSelected;
            const isRejected = ev.status === 'Rejected' || ev.status === 'Offline';

            return (
              <div
                key={ev.serverId}
                className={`p-2.5 rounded-lg border text-xs transition-all duration-200 ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.2)] ring-1 ring-cyan-500/40'
                    : isRejected
                    ? 'bg-rose-950/15 border-rose-900/30 opacity-75'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-medium">
                    {isSelected ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    ) : isRejected ? (
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex items-center justify-center text-[9px] text-slate-400">
                        •
                      </div>
                    )}
                    <span className={isSelected ? 'text-cyan-300 font-semibold' : 'text-slate-200'}>
                      {ev.serverName}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                          : ev.feasible
                          ? 'bg-slate-800 text-slate-300 border border-slate-700'
                          : 'bg-rose-950/60 text-rose-300 border border-rose-800/50'
                      }`}
                    >
                      {ev.status}
                    </span>
                  </div>
                </div>

                {/* Numbers */}
                <div className="grid grid-cols-2 gap-2 mt-1.5 pt-1 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
                  <div>
                    Current Load: <span className="text-slate-200 font-semibold">{ev.currentLoad}</span> / {ev.capacity}
                  </div>
                  <div className="text-right">
                    Remaining: <span className={ev.remainingCapacity < task.workload ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>{ev.remainingCapacity}</span>
                  </div>
                </div>

                {/* Reason description */}
                <div className="mt-1 text-[10px] text-slate-400 italic font-mono truncate">
                  {ev.reason}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decision Section */}
      <div className="mt-auto pt-3 border-t border-slate-800">
        <div className="flex items-center justify-center gap-1 text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">
          <span>DECISION</span>
          <ArrowDown className="w-3 h-3 text-cyan-400" />
        </div>

        {decisionType === 'ASSIGNED' ? (
          <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-950/60 via-blue-950/40 to-slate-900 border border-cyan-500/40">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="text-xs font-bold text-cyan-300 font-display">
                {selectedServerName} SELECTED
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              {decisionSummary}
            </p>
            <div className="mt-2 pt-2 border-t border-cyan-800/40 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Server Load Delta:</span>
              <span className="text-cyan-300 font-semibold">
                {currentStep.serverLoadBefore} units → {currentStep.serverLoadAfter} units (+{task.workload})
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <div className="text-xs font-bold text-rose-300 font-display">
                UNASSIGNED / WAITING
              </div>
            </div>
            <p className="text-xs text-rose-200 leading-relaxed font-mono">
              {decisionSummary}
            </p>
            <div className="mt-2 text-[10px] text-slate-400 font-mono">
              Task remains in pending queue until server capacity becomes available.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
