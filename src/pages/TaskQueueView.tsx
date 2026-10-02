import React, { useState } from 'react';
import { CloudTask } from '../types';
import { Layers, Plus, Clock, CheckCircle2, AlertTriangle, Trash2, Search, Filter, ShieldAlert } from 'lucide-react';

interface TaskQueueViewProps {
  tasks: CloudTask[];
  onOpenInjectModal: () => void;
  onDeleteTask: (id: string) => Promise<void>;
}

export const TaskQueueView: React.FC<TaskQueueViewProps> = ({
  tasks,
  onOpenInjectModal,
  onDeleteTask,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ASSIGNED' | 'WAITING'>('ALL');
  const [search, setSearch] = useState('');

  const filteredTasks = tasks.filter((t) => {
    if (filter !== 'ALL' && t.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
    }
    return true;
  });

  const waitingTasks = tasks.filter((t) => t.status === 'WAITING');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-r from-[#0C1220] to-[#0A0D16] p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Workload Management Engine
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
              Cloud Task Queue
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Inspect incoming computing jobs, test oversized edge cases, and analyze the queue state before and after algorithmic distribution.
            </p>
          </div>

          <button
            onClick={onOpenInjectModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-display font-bold text-xs tracking-wide bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:brightness-110 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>INJECT CUSTOM TASK</span>
          </button>
        </div>
      </div>

      {/* Unassigned / Waiting Alert Banner if any task failed to fit */}
      {waitingTasks.length > 0 && (
        <div className="rounded-xl border border-rose-800/60 bg-rose-950/30 p-4 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-rose-300 font-display">
                Resource Shortage: {waitingTasks.length} Task(s) in WAITING State
              </h4>
              <p className="text-xs text-rose-200/80 mt-1">
                The greedy algorithm safely flagged these tasks as unassigned because no currently online server has sufficient remaining capacity to accommodate their workload without exceeding capacity limits.
              </p>
              <div className="mt-2 space-y-1">
                {waitingTasks.map((t) => (
                  <div key={t.id} className="text-[11px] font-mono text-rose-300 flex items-center gap-2">
                    <span className="font-bold">• {t.name} ({t.workload} units):</span>
                    <span className="text-slate-400 italic">{t.failureReason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0C101A]/90 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['ALL', 'PENDING', 'ASSIGNED', 'WAITING'] as const).map((st) => {
            const count = st === 'ALL' ? tasks.length : tasks.filter((t) => t.status === st).length;
            return (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                  filter === st
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search task name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 font-mono"
          />
        </div>
      </div>

      {/* Tasks Table / Grid */}
      <div className="rounded-xl border border-slate-800 bg-[#0C101A]/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] bg-slate-900/60">
                <th className="py-3 px-4">Task ID</th>
                <th className="py-3 px-4">Task Name</th>
                <th className="py-3 px-4">Workload</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Arrival Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Node</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500 font-mono">
                    No tasks found matching current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => {
                  const isAssigned = t.status === 'ASSIGNED';
                  const isWaiting = t.status === 'WAITING';

                  return (
                    <tr key={t.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 text-cyan-400 font-semibold">{t.id}</td>
                      <td className="py-3 px-4 text-white font-medium">{t.name}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-amber-400">{t.workload}</span> units
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.priority === 'CRITICAL'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : t.priority === 'HIGH'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {t.priority || 'MEDIUM'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{t.arrivalTime}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isAssigned
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                              : isWaiting
                              ? 'bg-rose-950/80 text-rose-300 border-rose-700'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {isAssigned ? (
                          <span className="text-cyan-300 font-semibold">{t.assignedServerName}</span>
                        ) : isWaiting ? (
                          <span className="text-rose-400 text-[11px] truncate block max-w-xs" title={t.failureReason}>
                            ⚠️ Insufficient Cap
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">Pending schedule</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onDeleteTask(t.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
