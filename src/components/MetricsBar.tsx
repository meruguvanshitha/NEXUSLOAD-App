import React from 'react';
import { AlgorithmicMetrics } from '../types';
import { BarChart3, TrendingDown, Layers, Server, Activity, ShieldCheck, Scale } from 'lucide-react';

interface MetricsBarProps {
  metrics: AlgorithmicMetrics;
  compact?: boolean;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ metrics, compact = false }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Load Spread (The key DAA load balancing metric) */}
      <div className="rounded-xl border border-cyan-500/30 bg-[#0C1220]/90 p-3 shadow-[0_0_15px_rgba(6,182,212,0.1)] backdrop-blur-md">
        <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 mb-1">
          <span className="uppercase tracking-wider font-semibold">Load Spread</span>
          <Scale className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-bold font-mono text-white">
            {metrics.loadSpread}
          </span>
          <span className="text-[10px] font-mono text-cyan-300">units</span>
        </div>
        <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
          Max ({metrics.maxLoad}) - Min ({metrics.minLoad})
        </div>
      </div>

      {/* 2. Average Load */}
      <div className="rounded-xl border border-slate-800 bg-[#0C101A]/90 p-3 backdrop-blur-md">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
          <span className="uppercase tracking-wider">Avg Server Load</span>
          <Activity className="w-3.5 h-3.5 text-blue-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-bold font-mono text-white">
            {metrics.avgLoad}
          </span>
          <span className="text-[10px] font-mono text-slate-400">units</span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
          Avg Util: {metrics.avgServerUtilization}%
        </div>
      </div>

      {/* 3. Max Utilization Peak */}
      <div className="rounded-xl border border-slate-800 bg-[#0C101A]/90 p-3 backdrop-blur-md">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
          <span className="uppercase tracking-wider">Peak Server Load</span>
          <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-xl sm:text-2xl font-bold font-mono ${
            metrics.maxServerUtilization > 90 ? 'text-rose-400' : metrics.maxServerUtilization > 75 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {metrics.maxServerUtilization}%
          </span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
          Peak Load: {metrics.maxLoad} units
        </div>
      </div>

      {/* 4. Tasks Assigned */}
      <div className="rounded-xl border border-slate-800 bg-[#0C101A]/90 p-3 backdrop-blur-md">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
          <span className="uppercase tracking-wider">Tasks Assigned</span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
            {metrics.assignedTasks}
          </span>
          <span className="text-[10px] font-mono text-slate-400">/ {metrics.totalTasks}</span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
          {Math.round((metrics.assignedTasks / (metrics.totalTasks || 1)) * 100)}% resolved
        </div>
      </div>

      {/* 5. Tasks Waiting (Unassigned due to capacity) */}
      <div className="rounded-xl border border-slate-800 bg-[#0C101A]/90 p-3 backdrop-blur-md">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
          <span className="uppercase tracking-wider">Tasks Waiting</span>
          <Layers className="w-3.5 h-3.5 text-rose-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-xl sm:text-2xl font-bold font-mono ${
            metrics.waitingTasks > 0 ? 'text-rose-400' : 'text-slate-400'
          }`}>
            {metrics.waitingTasks}
          </span>
          <span className="text-[10px] font-mono text-slate-400">unassigned</span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
          {metrics.waitingTasks > 0 ? 'Exceeds node limits' : '0 bottlenecks'}
        </div>
      </div>

      {/* 6. Cluster Capacity Used */}
      <div className="rounded-xl border border-slate-800 bg-[#0C101A]/90 p-3 backdrop-blur-md">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
          <span className="uppercase tracking-wider">Total Headroom</span>
          <Server className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-bold font-mono text-white">
            {metrics.totalCapacity - metrics.totalUsedCapacity}
          </span>
          <span className="text-[10px] font-mono text-slate-400">/ {metrics.totalCapacity}</span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
          Used: {metrics.totalUsedCapacity} units
        </div>
      </div>
    </div>
  );
};
