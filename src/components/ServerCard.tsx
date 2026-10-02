import React from 'react';
import { CloudServer } from '../types';
import { Server, Activity, ShieldAlert, AlertOctagon, CheckCircle2, Power, HardDrive, Cpu, Sliders } from 'lucide-react';

interface ServerCardProps {
  server: CloudServer;
  isEvaluating?: boolean;
  isSelected?: boolean;
  isRejected?: boolean;
  onToggleOffline?: (serverId: string, currentStatus: CloudServer['status']) => void;
  onAdjustCapacity?: (serverId: string, newCapacity: number) => void;
  compact?: boolean;
}

export const ServerCard: React.FC<ServerCardProps> = ({
  server,
  isEvaluating,
  isSelected,
  isRejected,
  onToggleOffline,
  onAdjustCapacity,
  compact = false,
}) => {
  const isOffline = server.status === 'OFFLINE';
  const util = server.capacity > 0 ? Math.round((server.currentLoad / server.capacity) * 100) : 0;
  const remaining = Math.max(0, server.capacity - server.currentLoad);

  // Status styling configuration
  const statusConfig = {
    STABLE: {
      label: 'STABLE',
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300',
      barColor: 'bg-emerald-500',
      pulseColor: 'bg-emerald-400',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    },
    BUSY: {
      label: 'BUSY',
      color: 'text-amber-400',
      badgeBg: 'bg-amber-950/60 border-amber-800/60 text-amber-300',
      barColor: 'bg-amber-500',
      pulseColor: 'bg-amber-400',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    },
    NEAR_CAPACITY: {
      label: 'NEAR CAPACITY',
      color: 'text-orange-400',
      badgeBg: 'bg-orange-950/60 border-orange-800/60 text-orange-300',
      barColor: 'bg-orange-500',
      pulseColor: 'bg-orange-400',
      glow: 'shadow-[0_0_18px_rgba(249,115,22,0.2)]',
    },
    OVERLOADED: {
      label: 'OVERLOADED',
      color: 'text-rose-400',
      badgeBg: 'bg-rose-950/70 border-rose-800/70 text-rose-300',
      barColor: 'bg-rose-500',
      pulseColor: 'bg-rose-400',
      glow: 'shadow-[0_0_20px_rgba(244,63,94,0.3)]',
    },
    OFFLINE: {
      label: 'OFFLINE',
      color: 'text-slate-500',
      badgeBg: 'bg-slate-900 border-slate-700 text-slate-400',
      barColor: 'bg-slate-600',
      pulseColor: 'bg-slate-600',
      glow: '',
    },
  }[server.status] || {
    label: server.status,
    color: 'text-slate-400',
    badgeBg: 'bg-slate-800 border-slate-700 text-slate-300',
    barColor: 'bg-cyan-500',
    pulseColor: 'bg-cyan-400',
    glow: '',
  };

  return (
    <div
      className={`relative rounded-xl border transition-all duration-300 backdrop-blur-md overflow-hidden flex flex-col ${
        isSelected
          ? 'bg-[#0E1726] border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.35)] scale-[1.02] ring-2 ring-cyan-400/50'
          : isEvaluating
          ? 'bg-[#0C1220] border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/40'
          : isRejected
          ? 'bg-[#0D0F17] border-rose-900/60 opacity-80'
          : isOffline
          ? 'bg-[#0A0D14]/70 border-slate-800/80 opacity-60'
          : `bg-[#0C101A]/90 border-slate-800/90 hover:border-slate-700 ${statusConfig.glow}`
      } ${compact ? 'p-3.5' : 'p-4'}`}
    >
      {/* Top Banner & Name */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
              isSelected
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                : isOffline
                ? 'bg-slate-900 border-slate-800 text-slate-600'
                : 'bg-slate-900/80 border-slate-800 text-slate-400'
            }`}
          >
            <Server className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-semibold text-white truncate font-display tracking-wide">
              {server.name}
            </h4>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span>{server.region}</span>
              <span>•</span>
              <span className="text-slate-500">{server.specs.tier}</span>
            </div>
          </div>
        </div>

        {/* Status Pill with live pulse */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${statusConfig.badgeBg}`}
          >
            {!isOffline && (
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.pulseColor} animate-pulse`} />
            )}
            {statusConfig.label}
          </span>

          {onToggleOffline && (
            <button
              onClick={() => onToggleOffline(server.id, server.status)}
              className={`p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer ${
                isOffline ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400' : 'bg-slate-800 hover:bg-slate-700'
              }`}
              title={isOffline ? 'Bring Server Online' : 'Simulate Server Outage (Offline)'}
            >
              <Power className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Utilization Bar */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Load Utilization</span>
          <span className={`font-bold ${statusConfig.color}`}>{util}%</span>
        </div>

        <div className="w-full h-2.5 bg-slate-900/90 rounded-full overflow-hidden p-0.5 border border-slate-800/80">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${statusConfig.barColor}`}
            style={{ width: `${Math.min(100, util)}%` }}
          />
        </div>

        {/* Workload numbers */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>
            <strong className="text-white">{server.currentLoad}</strong> / {server.capacity} units
          </span>
          <span className={remaining < 15 ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
            {remaining} units free
          </span>
        </div>
      </div>

      {/* Task Queue & Load Breakdown */}
      <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-800/80 text-xs">
        <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800/60">
          <div className="text-[10px] text-slate-400 font-mono">Active Tasks</div>
          <div className="text-sm font-bold text-white font-mono flex items-center gap-1.5 mt-0.5">
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            <span>{server.assignedTaskIds.length}</span>
          </div>
        </div>

        <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800/60">
          <div className="text-[10px] text-slate-400 font-mono">Headroom</div>
          <div className="text-sm font-bold font-mono text-emerald-400 flex items-center gap-1.5 mt-0.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>{remaining} cap</span>
          </div>
        </div>
      </div>

      {/* Capacity adjuster in detailed view */}
      {onAdjustCapacity && !compact && (
        <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-mono flex items-center gap-1">
            <Sliders className="w-3 h-3 text-slate-400" />
            Capacity
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onAdjustCapacity(server.id, Math.max(30, server.capacity - 20))}
              className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-xs cursor-pointer"
              title="Decrease capacity"
            >
              -20
            </button>
            <span className="font-mono text-slate-300 px-1">{server.capacity}</span>
            <button
              onClick={() => onAdjustCapacity(server.id, server.capacity + 20)}
              className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-xs cursor-pointer"
              title="Increase capacity"
            >
              +20
            </button>
          </div>
        </div>
      )}

      {/* Evaluating / Selection Glow Tag */}
      {isSelected && (
        <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-cyan-500 via-sky-400 to-cyan-500 animate-pulse" />
      )}
    </div>
  );
};
