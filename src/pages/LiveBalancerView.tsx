import React from 'react';
import { CloudServer, CloudTask, DecisionStep, AlgorithmicMetrics } from '../types';
import { CloudControlVisualization } from '../components/CloudControlVisualization';
import { DecisionPanel } from '../components/DecisionPanel';
import { SimulationControls } from '../components/SimulationControls';
import { Layers, CheckCircle2, Clock, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

interface LiveBalancerViewProps {
  servers: CloudServer[];
  tasks: CloudTask[];
  currentStep: DecisionStep | null;
  isSimulating: boolean;
  isPaused: boolean;
  onStartSimulation: () => void;
  onPauseResume: () => void;
  onStepForward: () => void;
  onSkipToResult: () => void;
  onReset: () => void;
  algorithm: 'GREEDY_LINEAR' | 'GREEDY_HEAP';
  setAlgorithm: (algo: 'GREEDY_LINEAR' | 'GREEDY_HEAP') => void;
  simSpeed: number;
  setSimSpeed: (speed: number) => void;
  selectedServerId?: string;
  isEvaluating: boolean;
}

export const LiveBalancerView: React.FC<LiveBalancerViewProps> = ({
  servers,
  tasks,
  currentStep,
  isSimulating,
  isPaused,
  onStartSimulation,
  onPauseResume,
  onStepForward,
  onSkipToResult,
  onReset,
  algorithm,
  setAlgorithm,
  simSpeed,
  setSimSpeed,
  selectedServerId,
  isEvaluating,
}) => {
  const pendingTasks = tasks.filter(t => t.status === 'PENDING');
  const assignedTasks = tasks.filter(t => t.status === 'ASSIGNED');
  const waitingTasks = tasks.filter(t => t.status === 'WAITING');

  const currentTaskId = currentStep?.task.id;

  return (
    <div className="space-y-6">
      {/* Simulation Controls Bar */}
      <SimulationControls
        isSimulating={isSimulating}
        isPaused={isPaused}
        onStartSimulation={onStartSimulation}
        onPauseResume={onPauseResume}
        onStepForward={onStepForward}
        onSkipToResult={onSkipToResult}
        onReset={onReset}
        pendingCount={pendingTasks.length}
        totalTasks={tasks.length}
        algorithm={algorithm}
        setAlgorithm={setAlgorithm}
        simSpeed={simSpeed}
        setSimSpeed={setSimSpeed}
      />

      {/* Central Cloud Control Topology Visualization */}
      <CloudControlVisualization
        servers={servers}
        currentStep={currentStep}
        isEvaluating={isEvaluating}
        selectedServerId={selectedServerId}
      />

      {/* Bottom Grid: Left = Live Decision Trace; Right = Incoming Task Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Decision Panel (7 cols) */}
        <div className="lg:col-span-7">
          <DecisionPanel
            currentStep={currentStep}
            isEvaluating={isEvaluating}
          />
        </div>

        {/* Right Column: Live Incoming Task Queue (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="h-full rounded-xl border border-slate-800/80 bg-[#0C101A]/95 p-5 shadow-xl backdrop-blur-md flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-white">
                  Incoming Task Queue ({tasks.length})
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="text-cyan-400 font-bold">{pendingTasks.length} Pending</span>
                <span>•</span>
                <span className="text-emerald-400">{assignedTasks.length} Done</span>
                {waitingTasks.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-rose-400 font-bold">{waitingTasks.length} Waiting</span>
                  </>
                )}
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1 flex-1">
              {tasks.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-500 font-mono">
                  No tasks currently in cluster queue.
                </div>
              ) : (
                tasks.map((task) => {
                  const isCurrent = task.id === currentTaskId;
                  const isPending = task.status === 'PENDING';
                  const isAssigned = task.status === 'ASSIGNED';
                  const isWaiting = task.status === 'WAITING';

                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-lg border text-xs transition-all duration-200 ${
                        isCurrent
                          ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50'
                          : isAssigned
                          ? 'bg-slate-900/40 border-slate-800/80 opacity-75'
                          : isWaiting
                          ? 'bg-rose-950/20 border-rose-800/60'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {isCurrent ? (
                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
                          ) : isAssigned ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : isWaiting ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          )}
                          <div className="truncate">
                            <span className="font-semibold text-white block truncate">{task.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {task.id} • Arrived {task.arrivalTime}
                            </span>
                          </div>
                        </div>

                        {/* Workload and status */}
                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-bold text-amber-400">
                            {task.workload} u
                          </span>
                          <div className="mt-0.5">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                                isAssigned
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                                  : isWaiting
                                  ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                                  : isCurrent
                                  ? 'bg-cyan-900 text-cyan-200 border border-cyan-500 animate-pulse'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {isCurrent ? 'PROCESSING' : task.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Assigned destination or waiting note */}
                      {isAssigned && task.assignedServerName && (
                        <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>Dispatched to:</span>
                          <span className="text-cyan-300 font-semibold">{task.assignedServerName}</span>
                        </div>
                      )}

                      {isWaiting && task.failureReason && (
                        <div className="mt-2 pt-1.5 border-t border-rose-900/40 text-[10px] font-mono text-rose-300">
                          ⚠️ {task.failureReason}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Queue Footer status */}
            <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Greedy Evaluation:</span>
              <span className="text-cyan-300 font-semibold">
                {algorithm === 'GREEDY_LINEAR' ? 'Linear Scan O(T×S)' : 'Min-Heap O(T log S)'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
