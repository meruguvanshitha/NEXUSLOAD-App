import React, { useState } from 'react';
import { 
  Database, 
  ChevronDown, 
  ChevronUp, 
  Terminal, 
  Layers, 
  Server, 
  FileText, 
  Clock, 
  Copy, 
  Check, 
  Trash2, 
  ExternalLink,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { CloudServer, CloudTask, MongooseAuditEntry } from '../types';

interface MongoArchitectureSectionProps {
  servers: CloudServer[];
  tasks: CloudTask[];
  auditLogs: MongooseAuditEntry[];
  onClearLogs?: () => void;
  defaultOpen?: boolean;
}

export const MongoArchitectureSection: React.FC<MongoArchitectureSectionProps> = ({
  servers,
  tasks,
  auditLogs,
  onClearLogs,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'tasks' | 'servers' | 'audit_logs'>('ALL');
  const [copied, setCopied] = useState<boolean>(false);

  const pendingCount = tasks.filter(t => t.status === 'PENDING').length;
  const assignedCount = tasks.filter(t => t.status === 'ASSIGNED').length;
  const waitingCount = tasks.filter(t => t.status === 'WAITING').length;
  const onlineServers = servers.filter(s => s.status !== 'OFFLINE').length;
  const totalAssignedRefs = servers.reduce((acc, s) => acc + s.assignedTaskIds.length, 0);

  const filteredLogs = activeFilter === 'ALL' 
    ? auditLogs 
    : auditLogs.filter(log => log.collectionName === activeFilter);

  const handleCopyLogs = () => {
    const text = filteredLogs.map(l => `[${l.timeFormatted}] ${l.operation}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-800/90 bg-[#0A0E17]/95 shadow-2xl overflow-hidden backdrop-blur-md transition-all">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-slate-900/80 via-[#0B101E]/90 to-slate-900/80 hover:bg-slate-900 transition-colors text-left cursor-pointer border-b border-slate-800/80"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Database className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold font-display uppercase tracking-wide text-white">
                Full-Stack Architecture & MongoDB State
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                MONGOOSE ORM ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Node.js + Express REST API • MongoDB Database Collections • Real-Time Mongoose Driver Operations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Connected: <strong className="text-white">mongodb://nexusload-cluster</strong>
            </span>
          </div>
          <div className="p-1 rounded-lg bg-slate-800 text-slate-300">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="p-5 space-y-6">
          {/* Top: 3-Tier Architecture Dataflow Diagram */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center justify-between">
              <span>Full-Stack Pipeline Dataflow</span>
              <span className="text-cyan-400">REST API & Mongoose Integration</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center text-center text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#0C1220] border border-cyan-500/30 text-cyan-300">
                <div className="font-bold">1. React Client</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Vite SPA • UI State</div>
              </div>
              <div className="text-slate-600 font-bold text-sm hidden md:block">→</div>
              <div className="p-2.5 rounded-lg bg-[#0C1220] border border-purple-500/30 text-purple-300">
                <div className="font-bold">2. Express REST API</div>
                <div className="text-[10px] text-slate-400 mt-0.5">/api/balance/step</div>
              </div>
              <div className="text-slate-600 font-bold text-sm hidden md:block">→</div>
              <div className="p-2.5 rounded-lg bg-[#0C1220] border border-emerald-500/30 text-emerald-300">
                <div className="font-bold">3. Mongoose & MongoDB</div>
                <div className="text-[10px] text-slate-400 mt-0.5">tasks • servers • audit_logs</div>
              </div>
            </div>
          </div>

          {/* Middle: Visual Schema Cards Mapping Frontend Tasks to MongoDB Collections */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  MongoDB Database Schema Mapping (Collections)
                </h4>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Document Store Representation</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Collection 1: tasks */}
              <div className="rounded-xl border border-slate-800 bg-[#0C101A] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2.5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-mono text-xs font-bold text-cyan-300">db.tasks</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {tasks.length} Documents
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 bg-slate-950/80 p-2.5 rounded-lg border border-slate-900 mb-3 space-y-1">
                    <div><span className="text-purple-400">_id:</span> <span className="text-amber-300">ObjectId</span></div>
                    <div><span className="text-purple-400">name:</span> <span className="text-emerald-300">String</span></div>
                    <div><span className="text-purple-400">workload:</span> <span className="text-cyan-300">Number</span> (units)</div>
                    <div><span className="text-purple-400">status:</span> <span className="text-rose-300">"PENDING"|"ASSIGNED"|"WAITING"</span></div>
                    <div><span className="text-purple-400">assignedServerId:</span> <span className="text-amber-300">ObjectId | null</span></div>
                    <div><span className="text-purple-400">assignedAt:</span> <span className="text-slate-500">ISODate</span></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-1 text-center text-[10px] font-mono">
                  <div className="bg-slate-900/60 p-1.5 rounded">
                    <span className="text-slate-400 block">Pending</span>
                    <strong className="text-amber-400">{pendingCount}</strong>
                  </div>
                  <div className="bg-slate-900/60 p-1.5 rounded">
                    <span className="text-slate-400 block">Assigned</span>
                    <strong className="text-emerald-400">{assignedCount}</strong>
                  </div>
                  <div className="bg-slate-900/60 p-1.5 rounded">
                    <span className="text-slate-400 block">Waiting</span>
                    <strong className="text-rose-400">{waitingCount}</strong>
                  </div>
                </div>
              </div>

              {/* Collection 2: servers */}
              <div className="rounded-xl border border-slate-800 bg-[#0C101A] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2.5">
                    <div className="flex items-center gap-2">
                      <Server className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-mono text-xs font-bold text-emerald-300">db.servers</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {servers.length} Documents
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 bg-slate-950/80 p-2.5 rounded-lg border border-slate-900 mb-3 space-y-1">
                    <div><span className="text-purple-400">_id:</span> <span className="text-amber-300">ObjectId</span></div>
                    <div><span className="text-purple-400">name:</span> <span className="text-emerald-300">String</span></div>
                    <div><span className="text-purple-400">capacity:</span> <span className="text-cyan-300">Number</span> (units)</div>
                    <div><span className="text-purple-400">currentLoad:</span> <span className="text-cyan-300">Number</span> (live)</div>
                    <div><span className="text-purple-400">status:</span> <span className="text-amber-300">"STABLE"|"BUSY"|...</span></div>
                    <div><span className="text-purple-400">assignedTaskIds:</span> <span className="text-purple-300">[ObjectId]</span></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-1 text-center text-[10px] font-mono">
                  <div className="bg-slate-900/60 p-1.5 rounded">
                    <span className="text-slate-400 block">Online</span>
                    <strong className="text-emerald-400">{onlineServers}</strong>
                  </div>
                  <div className="bg-slate-900/60 p-1.5 rounded">
                    <span className="text-slate-400 block">Offline</span>
                    <strong className="text-slate-400">{servers.length - onlineServers}</strong>
                  </div>
                  <div className="bg-slate-900/60 p-1.5 rounded">
                    <span className="text-slate-400 block">Task Refs</span>
                    <strong className="text-cyan-300">{totalAssignedRefs}</strong>
                  </div>
                </div>
              </div>

              {/* Collection 3: audit_logs */}
              <div className="rounded-xl border border-slate-800 bg-[#0C101A] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2.5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                      <span className="font-mono text-xs font-bold text-purple-300">db.audit_logs</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {auditLogs.length} Entries
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 bg-slate-950/80 p-2.5 rounded-lg border border-slate-900 mb-3 space-y-1">
                    <div><span className="text-purple-400">_id:</span> <span className="text-amber-300">ObjectId</span></div>
                    <div><span className="text-purple-400">taskId:</span> <span className="text-cyan-300">ObjectId</span> (ref)</div>
                    <div><span className="text-purple-400">serverId:</span> <span className="text-emerald-300">ObjectId</span> (ref)</div>
                    <div><span className="text-purple-400">deltaLoad:</span> <span className="text-amber-300">Number</span> (+workload)</div>
                    <div><span className="text-purple-400">action:</span> <span className="text-slate-300">"GREEDY_DISPATCH"</span></div>
                    <div><span className="text-purple-400">timestamp:</span> <span className="text-slate-500">ISODate</span></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-1 text-center text-[10px] font-mono">
                  <div className="bg-slate-900/60 p-1.5 rounded">
                    <span className="text-slate-400 block">Total Dispatched</span>
                    <strong className="text-purple-300">{auditLogs.filter(l => l.status === 'SUCCESS').length}</strong>
                  </div>
                  <div className="bg-slate-900/60 p-1.5 rounded">
                    <span className="text-slate-400 block">Exhaustion Logs</span>
                    <strong className="text-rose-400">{auditLogs.filter(l => l.status !== 'SUCCESS').length}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Simulated Dynamic Mongoose Audit Trail Log Terminal */}
          <div className="rounded-xl border border-slate-800 bg-[#070A10] p-4 shadow-xl">
            {/* Terminal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Live Mongoose ORM Execution Stream (Task.findByIdAndUpdate())
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
              </div>

              {/* Filter Tabs & Actions */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-800 text-[11px] font-mono">
                  {(['ALL', 'tasks', 'servers', 'audit_logs'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveFilter(tab)}
                      className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                        activeFilter === tab
                          ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleCopyLogs}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 transition-colors cursor-pointer"
                  title="Copy log lines to clipboard"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {onClearLogs && (
                  <button
                    onClick={onClearLogs}
                    className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Clear terminal stream"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Terminal Body */}
            <div className="font-mono text-[11px] space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {filteredLogs.length === 0 ? (
                <div className="text-slate-500 py-6 text-center italic">
                  // Mongoose execution stream initialized. Waiting for task routing events...
                  <br />
                  // Click "LAUNCH LIVE BALANCER" or "RUN SCENARIO BALANCING" to trigger live atomic updates.
                </div>
              ) : (
                filteredLogs.map(log => {
                  const isSuccess = log.status === 'SUCCESS';
                  const isWaiting = log.status === 'WAITING_CAPACITY';

                  return (
                    <div
                      key={log.id}
                      className="p-2 rounded bg-slate-950/60 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col gap-0.5"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <span className="text-slate-400">[{log.timeFormatted}]</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 font-bold border border-slate-800">
                            db.{log.collectionName}
                          </span>
                          <span className="text-cyan-400 font-semibold">{log.method}()</span>
                        </span>
                        <span className="text-slate-500">{log.durationMs}ms</span>
                      </div>

                      {/* Code Execution String */}
                      <div className="text-slate-200 overflow-x-auto whitespace-pre font-mono text-xs">
                        <span className="text-purple-400">await </span>
                        <span className="text-cyan-300">{log.operation.split('(')[0]}</span>
                        <span className="text-slate-400">(</span>
                        <span className="text-amber-300">
                          {log.operation.slice(log.operation.indexOf('(') + 1, -1)}
                        </span>
                        <span className="text-slate-400">);</span>
                      </div>

                      {/* Detail note */}
                      <div className={`text-[10px] ${
                        isSuccess ? 'text-emerald-400' : isWaiting ? 'text-rose-400' : 'text-amber-400'
                      }`}>
                        → {log.detail}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
