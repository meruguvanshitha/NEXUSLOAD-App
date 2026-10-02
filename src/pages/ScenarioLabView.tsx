import React, { useState } from 'react';
import { ScenarioType, ScenarioDefinition, CloudServer, CloudTask, AlgorithmicMetrics } from '../types';
import { PREDEFINED_SCENARIOS } from '../server/db';
import { Cpu, Play, CheckCircle2, AlertTriangle, Scale, Activity, ArrowRight, Zap, BookOpen, Layers } from 'lucide-react';

interface ScenarioLabViewProps {
  currentScenario: ScenarioType;
  onSelectScenario: (id: ScenarioType) => Promise<void>;
  onRunBalancing: (algo: 'GREEDY_LINEAR' | 'GREEDY_HEAP') => Promise<void>;
  servers: CloudServer[];
  tasks: CloudTask[];
  metrics: AlgorithmicMetrics;
  isLoading: boolean;
}

export const ScenarioLabView: React.FC<ScenarioLabViewProps> = ({
  currentScenario,
  onSelectScenario,
  onRunBalancing,
  servers,
  tasks,
  metrics,
  isLoading,
}) => {
  const [selectedAlgo, setSelectedAlgo] = useState<'GREEDY_LINEAR' | 'GREEDY_HEAP'>('GREEDY_LINEAR');
  const scenariosList = Object.values(PREDEFINED_SCENARIOS);

  const pendingTasks = tasks.filter(t => t.status === 'PENDING');
  const waitingTasks = tasks.filter(t => t.status === 'WAITING');
  const assignedTasks = tasks.filter(t => t.status === 'ASSIGNED');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-r from-[#0C1220] via-[#0B0F1B] to-[#120E24] p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">
                DAA Algorithmic Simulation & Stress Testing
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
              Scenario Laboratory
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Load edge-case cluster environments to test greedy task allocation, capacity boundary constraints, peak load mitigation, and graceful resource exhaustion handling.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onRunBalancing(selectedAlgo)}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-bold text-xs tracking-wide bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:brightness-110 transition-all cursor-pointer disabled:opacity-40"
            >
              {pendingTasks.length === 0 ? <Zap className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{pendingTasks.length === 0 ? 'RE-RUN SCENARIO BALANCING' : 'RUN SCENARIO BALANCING'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Predefined Scenarios Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {scenariosList.map((sc) => {
          const isActive = currentScenario === sc.id;
          return (
            <div
              key={sc.id}
              className={`rounded-xl border p-4 transition-all duration-200 backdrop-blur-md flex flex-col justify-between ${
                isActive
                  ? 'bg-purple-950/20 border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.2)] ring-1 ring-purple-500/40'
                  : 'bg-[#0C101A]/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono text-[10px] uppercase font-bold text-slate-400">
                    {sc.id.replace('_', ' ')}
                  </span>
                  {isActive && (
                    <span className="flex items-center gap-1 text-[9px] font-mono text-purple-300 bg-purple-950 px-1.5 py-0.2 rounded border border-purple-700">
                      ACTIVE
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white mb-1.5 font-display">{sc.title}</h3>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">{sc.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <div className="text-[10px] text-slate-500 font-mono mb-2">
                  Expected: <span className="text-slate-300">{sc.expectedOutcome}</span>
                </div>

                <button
                  onClick={() => onSelectScenario(sc.id)}
                  disabled={isLoading || isActive}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isActive ? 'Current Scenario' : 'Load Scenario'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Algorithmic Results for Current Scenario */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#0C101A]/90 p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              Algorithmic Results for {currentScenario.replace('_', ' ')}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Real calculations generated dynamically by the manual Greedy balancer
            </p>
          </div>

          {/* Algorithm Strategy Switcher */}
          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-[10px] text-slate-500 uppercase px-1 font-bold">Engine:</span>
            <button
              onClick={() => setSelectedAlgo('GREEDY_LINEAR')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                selectedAlgo === 'GREEDY_LINEAR'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Linear Scan O(T×S)
            </button>
            <button
              onClick={() => setSelectedAlgo('GREEDY_HEAP')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                selectedAlgo === 'GREEDY_HEAP'
                  ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Min-Heap O(T log S)
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Tasks Processed</div>
            <div className="text-lg font-bold font-mono text-white mt-1">{tasks.length}</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Tasks Assigned</div>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-1">{assignedTasks.length}</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Tasks Waiting</div>
            <div className={`text-lg font-bold font-mono mt-1 ${waitingTasks.length > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {waitingTasks.length}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Average Util</div>
            <div className="text-lg font-bold font-mono text-cyan-300 mt-1">{metrics.avgServerUtilization}%</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Max Peak Util</div>
            <div className="text-lg font-bold font-mono text-amber-400 mt-1">{metrics.maxServerUtilization}%</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Load Spread</div>
            <div className="text-lg font-bold font-mono text-cyan-400 mt-1">{metrics.loadSpread} u</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Servers Used</div>
            <div className="text-lg font-bold font-mono text-purple-300 mt-1">{metrics.serversUsed} / {servers.length}</div>
          </div>
        </div>

        {/* Server Utilization Bars */}
        <div className="space-y-3">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
            Server Load Spread Visualization
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {servers.map((s) => {
              const util = s.capacity > 0 ? Math.round((s.currentLoad / s.capacity) * 100) : 0;
              return (
                <div key={s.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-white font-medium">{s.name.split(' ')[0]}</span>
                    <span className={util > 85 ? 'text-rose-400 font-bold' : 'text-cyan-300 font-bold'}>{util}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800 mb-1.5">
                    <div
                      className={`h-full rounded-full ${util > 85 ? 'bg-rose-500' : util > 65 ? 'bg-amber-500' : 'bg-cyan-500'}`}
                      style={{ width: `${Math.min(100, util)}%` }}
                    />
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 flex justify-between">
                    <span>{s.currentLoad} / {s.capacity} units</span>
                    <span className="text-slate-300">{s.assignedTaskIds.length} tasks</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* DAA Algorithmic Defense & Complexity Guide for Hackathon Judges */}
      <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-br from-[#0C101A] to-[#0A0D14] p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold font-display uppercase tracking-wider text-white">
            DAA Algorithmic Analysis & Judge Defense
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-slate-300">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-cyan-400 font-bold uppercase text-[11px] mb-1">1. Greedy Choice Property</div>
            <p className="text-slate-400 leading-relaxed font-sans text-xs">
              For each incoming task $T$, the algorithm scans all online servers $S$, filters out those where $Load(S) + Workload(T) &gt; Capacity(S)$, and immediately assigns $T$ to the server with the lowest current load. This makes locally optimal choices at each arrival point.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-purple-400 font-bold uppercase text-[11px] mb-1">2. Complexity Evaluation</div>
            <div className="space-y-1 text-slate-400 leading-relaxed">
              <div>• Linear Greedy Time: <strong className="text-white">O(T × S)</strong></div>
              <div>• Min-Heap Greedy Time: <strong className="text-white">O(T × log S)</strong></div>
              <div>• Auxiliary Space: <strong className="text-white">O(S + T)</strong></div>
              <p className="mt-1 text-slate-500 font-sans text-[11px]">
                Space maintains server capacity bounds and task arrival queues.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-amber-400 font-bold uppercase text-[11px] mb-1">3. Greedy vs Global Optimum</div>
            <p className="text-slate-400 leading-relaxed font-sans text-xs">
              Makespan minimization on heterogeneous servers is an NP-hard problem. Greedy task scheduling provides an online, deterministic approximation suitable for real-time cloud dispatchers without requiring intractable combinatorial backtracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
