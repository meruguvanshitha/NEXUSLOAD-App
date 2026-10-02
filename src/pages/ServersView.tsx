import React from 'react';
import { CloudServer, CloudTask } from '../types';
import { Server, Activity, Power, Sliders, HardDrive, Cpu, ShieldAlert, CheckCircle2, AlertOctagon } from 'lucide-react';

interface ServersViewProps {
  servers: CloudServer[];
  tasks: CloudTask[];
  onToggleOffline: (id: string, status: CloudServer['status']) => void;
  onAdjustCapacity: (id: string, newCap: number) => void;
}

export const ServersView: React.FC<ServersViewProps> = ({
  servers,
  tasks,
  onToggleOffline,
  onAdjustCapacity,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-r from-[#0C1220] to-[#0A0D16] p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Server className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Infrastructure Nodes & Pressure Monitor
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
              Cluster Server Fleet
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Inspect node capacity ceilings, simulate node failure by toggling nodes offline, or adjust capacity to evaluate how the Greedy Load Balancer re-routes incoming jobs.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Total Cluster Nodes</span>
              <strong className="text-white text-base">{servers.length}</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Total Cluster Capacity</span>
              <strong className="text-cyan-400 text-base">{servers.reduce((a, b) => a + (b.status !== 'OFFLINE' ? b.capacity : 0), 0)} u</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Server Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servers.map((server) => {
          const isOffline = server.status === 'OFFLINE';
          const util = server.capacity > 0 ? Math.round((server.currentLoad / server.capacity) * 100) : 0;
          const remaining = Math.max(0, server.capacity - server.currentLoad);

          // Get tasks assigned to this server
          const assignedTasks = tasks.filter(t => t.assignedServerId === server.id);

          const statusConfig = {
            STABLE: { label: 'STABLE', badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-700', bar: 'bg-emerald-500' },
            BUSY: { label: 'BUSY', badge: 'bg-amber-950/80 text-amber-300 border-amber-700', bar: 'bg-amber-500' },
            NEAR_CAPACITY: { label: 'NEAR CAPACITY', badge: 'bg-orange-950/80 text-orange-300 border-orange-700', bar: 'bg-orange-500' },
            OVERLOADED: { label: 'OVERLOADED', badge: 'bg-rose-950/80 text-rose-300 border-rose-700', bar: 'bg-rose-500' },
            OFFLINE: { label: 'OFFLINE', badge: 'bg-slate-900 text-slate-400 border-slate-700', bar: 'bg-slate-600' },
          }[server.status];

          return (
            <div
              key={server.id}
              className={`rounded-2xl border p-5 transition-all duration-200 backdrop-blur-md flex flex-col justify-between ${
                isOffline
                  ? 'bg-slate-950/60 border-slate-800 opacity-60'
                  : 'bg-[#0C101A]/95 border-slate-800 hover:border-slate-700 shadow-xl'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-bold font-display text-white">{server.name}</h3>
                    <div className="text-[11px] font-mono text-slate-400">
                      Region: <span className="text-cyan-300">{server.region}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${statusConfig?.badge}`}>
                      {statusConfig?.label}
                    </span>
                    <button
                      onClick={() => onToggleOffline(server.id, server.status)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        isOffline
                          ? 'bg-emerald-950 border-emerald-700 text-emerald-400 hover:bg-emerald-900'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                      title={isOffline ? 'Power On Node' : 'Simulate Node Outage'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-2 py-2 mb-3 bg-slate-900/60 rounded-lg p-2.5 border border-slate-800/80 text-[10px] font-mono text-slate-400">
                  <div>
                    <span className="block text-slate-500">CPU</span>
                    <strong className="text-white">{server.specs.cpuCores} Cores</strong>
                  </div>
                  <div>
                    <span className="block text-slate-500">RAM</span>
                    <strong className="text-white">{server.specs.ramGb} GB</strong>
                  </div>
                  <div>
                    <span className="block text-slate-500">Tier</span>
                    <strong className="text-cyan-300 truncate block">{server.specs.tier.split(' ')[0]}</strong>
                  </div>
                </div>

                {/* Utilization gauge */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Load Utilization</span>
                    <span className="font-bold text-white">{util}%</span>
                  </div>

                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${statusConfig?.bar}`}
                      style={{ width: `${Math.min(100, util)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>
                      Load: <strong className="text-white">{server.currentLoad}</strong> / {server.capacity} units
                    </span>
                    <span className={remaining < 15 ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
                      {remaining} units headroom
                    </span>
                  </div>
                </div>

                {/* Capacity modifier */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/40 border border-slate-800 text-xs font-mono mb-4">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    Capacity Limit:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onAdjustCapacity(server.id, Math.max(30, server.capacity - 20))}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded cursor-pointer"
                    >
                      -20
                    </button>
                    <span className="text-white font-bold px-1">{server.capacity}</span>
                    <button
                      onClick={() => onAdjustCapacity(server.id, server.capacity + 20)}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded cursor-pointer"
                    >
                      +20
                    </button>
                  </div>
                </div>
              </div>

              {/* Tasks currently hosted on this server */}
              <div className="border-t border-slate-800 pt-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-cyan-400" />
                    Hosted Tasks ({assignedTasks.length}):
                  </span>
                  <span className="text-[10px] text-slate-500">Queue: {server.assignedTaskIds.length}</span>
                </div>

                {assignedTasks.length === 0 ? (
                  <div className="text-[11px] font-mono text-slate-500 italic py-1">
                    No active tasks currently assigned to this node.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                    {assignedTasks.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between px-2 py-1 rounded bg-slate-900/80 border border-slate-800 text-[10px] font-mono"
                      >
                        <span className="text-slate-200 truncate max-w-[140px]">{t.name}</span>
                        <span className="text-amber-400 font-bold shrink-0">{t.workload} u</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
