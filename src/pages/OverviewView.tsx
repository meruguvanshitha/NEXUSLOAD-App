import React from 'react';
import { CloudServer, CloudTask, TaskAssignment, AlgorithmicMetrics, MongooseAuditEntry } from '../types';
import { MetricsBar } from '../components/MetricsBar';
import { ServerCard } from '../components/ServerCard';
import { MongoArchitectureSection } from '../components/MongoArchitectureSection';
import { Play, ArrowRight, ShieldCheck, Activity, Scale, CheckCircle2, AlertTriangle, Layers, Clock, Zap, Sparkles } from 'lucide-react';

interface OverviewViewProps {
  servers: CloudServer[];
  tasks: CloudTask[];
  assignments: TaskAssignment[];
  metrics: AlgorithmicMetrics;
  auditLogs: MongooseAuditEntry[];
  onClearAuditLogs: () => void;
  onNavigateToBalancer: () => void;
  onLaunchLiveBalancer: () => void;
  onQuickBalance: () => void;
  onToggleOffline: (id: string, status: CloudServer['status']) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  servers,
  tasks,
  assignments,
  metrics,
  auditLogs,
  onClearAuditLogs,
  onNavigateToBalancer,
  onLaunchLiveBalancer,
  onQuickBalance,
  onToggleOffline,
}) => {
  const pendingTasks = tasks.filter(t => t.status === 'PENDING');
  const assignedTasks = tasks.filter(t => t.status === 'ASSIGNED');
  const waitingTasks = tasks.filter(t => t.status === 'WAITING');

  // Baseline initial loads vs current loads to demonstrate Before vs After
  const beforeServers = servers.map(s => {
    const initial = s.initialLoad || Math.round(s.capacity * 0.4);
    const util = s.capacity > 0 ? Math.round((initial / s.capacity) * 100) : 0;
    return { name: s.name.split(' ')[0], load: initial, capacity: s.capacity, util };
  });

  const afterServers = servers.map(s => {
    const util = s.capacity > 0 ? Math.round((s.currentLoad / s.capacity) * 100) : 0;
    return { name: s.name.split(' ')[0], load: s.currentLoad, capacity: s.capacity, util };
  });

  const beforeMax = Math.max(...beforeServers.map(s => s.load));
  const beforeMin = Math.min(...beforeServers.map(s => s.load));
  const beforeSpread = beforeMax - beforeMin;

  return (
    <div className="space-y-6">
      {/* Hero Control Banner */}
      <div className="relative rounded-2xl border border-slate-800/80 bg-gradient-to-r from-[#0C1220] via-[#0A0E18] to-[#0D1527] p-6 shadow-2xl overflow-hidden backdrop-blur-md">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                ACTIVE CLOUD CLUSTER
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Telemetry Synchronized
              </span>
              {pendingTasks.length > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 animate-pulse">
                  {pendingTasks.length} JOBS AWAITING DISPATCH
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  ALL TASKS BALANCED
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">
              NEXUSLOAD Infrastructure Monitor
            </h1>
            <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">
              Greedy task load balancer actively distributing heterogeneous compute jobs to minimize queuing delays and prevent single-server saturation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={onLaunchLiveBalancer}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-display font-bold text-sm tracking-wide bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:brightness-110 transition-all cursor-pointer"
              title="Switch to Live Balancer and auto-start the live task dispatch simulation"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>LAUNCH LIVE BALANCER</span>
            </button>

            <button
              onClick={onQuickBalance}
              disabled={pendingTasks.length === 0}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-display font-bold text-sm tracking-wide bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:border-cyan-400 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Instantly execute Greedy Load Balancing on all pending tasks"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>QUICK BALANCE NOW</span>
            </button>
          </div>
        </div>
      </div>

      {/* Algorithmic Key Metrics Bar */}
      <MetricsBar metrics={metrics} />

      {/* Before vs After Balancing Comparison Cards */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#0C101A]/90 p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-white">
                Cluster Load Distribution Analysis
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live comparison of baseline node loads versus post-greedy balancing state
            </p>
          </div>
          <div className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-1 rounded border border-cyan-800/50 self-start sm:self-auto">
            Strategy: Greedy load distribution
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* BEFORE BALANCING */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                BEFORE BALANCING (Baseline)
              </span>
              <span className="text-xs font-mono text-slate-400">
                Load Spread: <strong className="text-amber-400">{beforeSpread} units</strong>
              </span>
            </div>

            <div className="space-y-3">
              {beforeServers.map((s, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">{s.name}</span>
                    <span className="text-slate-400">{s.load} / {s.capacity} ({s.util}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-slate-500 rounded-full"
                      style={{ width: `${Math.min(100, s.util)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-[11px] font-mono text-slate-400">
              <div>Max: <strong className="text-white">{beforeMax}</strong></div>
              <div>Min: <strong className="text-white">{beforeMin}</strong></div>
              <div>Spread: <strong className="text-amber-400">{beforeSpread}</strong></div>
            </div>
          </div>

          {/* AFTER BALANCING */}
          <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/20 p-4 shadow-[0_0_20px_rgba(6,182,212,0.08)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                AFTER BALANCING (Current Dynamic State)
              </span>
              <span className="text-xs font-mono text-cyan-400">
                Load Spread: <strong className="text-cyan-300">{metrics.loadSpread} units</strong>
              </span>
            </div>

            <div className="space-y-3">
              {afterServers.map((s, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-medium">{s.name}</span>
                    <span className={s.util > 85 ? 'text-rose-400 font-bold' : 'text-cyan-300 font-bold'}>
                      {s.load} / {s.capacity} ({s.util}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        s.util > 85 ? 'bg-rose-500' : s.util > 65 ? 'bg-amber-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${Math.min(100, s.util)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-cyan-800/40 grid grid-cols-3 gap-2 text-center text-[11px] font-mono text-cyan-300">
              <div>Max: <strong className="text-white">{metrics.maxLoad}</strong></div>
              <div>Min: <strong className="text-white">{metrics.minLoad}</strong></div>
              <div>Spread: <strong className="text-cyan-200">{metrics.loadSpread}</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Servers Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-white">
              Cloud Infrastructure Nodes ({servers.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {servers.filter(s => s.status !== 'OFFLINE').length} Online Nodes • {metrics.serversUsed} In Use
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {servers.map((server) => (
            <ServerCard
              key={server.id}
              server={server}
              onToggleOffline={onToggleOffline}
              compact
            />
          ))}
        </div>
      </div>

      {/* Full-Stack Architecture & MongoDB State Section */}
      <MongoArchitectureSection
        servers={servers}
        tasks={tasks}
        auditLogs={auditLogs}
        onClearLogs={onClearAuditLogs}
        defaultOpen={true}
      />

      {/* Live Assignment Stream */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#0C101A]/90 p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-white">
              Recent Task Dispatch History ({assignments.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Real-time Mongoose Audit Trail</span>
        </div>

        {assignments.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 font-mono">
            No assignments recorded yet. Launch the Live Balancer or click "QUICK BALANCE NOW" to dispatch pending tasks.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3">Task ID & Name</th>
                  <th className="py-2 px-3">Assigned Server</th>
                  <th className="py-2 px-3">Workload</th>
                  <th className="py-2 px-3">Load Transition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {assignments.slice(0, 8).map((a) => (
                  <tr key={a.id} className="hover:bg-slate-900/40">
                    <td className="py-2 px-3 text-slate-400">
                      {new Date(a.assignedAt).toLocaleTimeString()}
                    </td>
                    <td className="py-2 px-3 text-white font-medium">
                      {a.taskName} <span className="text-[10px] text-slate-500">({a.taskId})</span>
                    </td>
                    <td className="py-2 px-3 text-cyan-300 font-semibold">
                      {a.serverName}
                    </td>
                    <td className="py-2 px-3 text-amber-400 font-bold">
                      {a.workload} u
                    </td>
                    <td className="py-2 px-3 text-slate-300">
                      {a.previousLoad} → <strong className="text-cyan-400">{a.newLoad}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
