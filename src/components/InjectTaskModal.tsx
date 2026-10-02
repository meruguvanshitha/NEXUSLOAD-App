import React, { useState } from 'react';
import { X, Plus, AlertCircle, Sparkles } from 'lucide-react';
import { CloudTask } from '../types';

interface InjectTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInject: (task: { name: string; workload: number; priority: CloudTask['priority'] }) => Promise<void>;
}

export const InjectTaskModal: React.FC<InjectTaskModalProps> = ({
  isOpen,
  onClose,
  onInject,
}) => {
  const [name, setName] = useState('');
  const [workload, setWorkload] = useState('30');
  const [priority, setPriority] = useState<CloudTask['priority']>('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a task name');
      return;
    }
    const wlNum = Number(workload);
    if (isNaN(wlNum) || wlNum <= 0) {
      setError('Workload must be a positive integer greater than 0');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onInject({
        name: name.trim(),
        workload: wlNum,
        priority,
      });
      setName('');
      setWorkload('30');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to inject task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickPreset = (presetName: string, presetWorkload: number, presetPriority: CloudTask['priority']) => {
    setName(presetName);
    setWorkload(presetWorkload.toString());
    setPriority(presetPriority);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-cyan-500/30 bg-[#0C101A] p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-display">Inject Cloud Workload</h3>
            <p className="text-xs text-slate-400">Test the Greedy Balancer under custom task loads</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Presets */}
        <div className="mb-4">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2">
            Quick Test Presets
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickPreset('Light Ping Job', 12, 'LOW')}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-colors cursor-pointer"
            >
              <div className="text-slate-200 font-medium">Light Ping</div>
              <div className="text-[10px] text-cyan-400 font-mono">12 units • Fits anywhere</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPreset('Media Transcoding', 35, 'HIGH')}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-colors cursor-pointer"
            >
              <div className="text-slate-200 font-medium">Media Transcode</div>
              <div className="text-[10px] text-amber-400 font-mono">35 units • Greedy test</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPreset('Heavy ML Batch Model', 65, 'HIGH')}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-colors cursor-pointer"
            >
              <div className="text-slate-200 font-medium">Heavy ML Batch</div>
              <div className="text-[10px] text-orange-400 font-mono">65 units • High demand</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPreset('Oversized Database Migration', 160, 'CRITICAL')}
              className="p-2 rounded-lg bg-slate-900 border border-rose-900/60 hover:border-rose-700 text-left transition-colors cursor-pointer"
            >
              <div className="text-rose-300 font-medium">Oversized Task</div>
              <div className="text-[10px] text-rose-400 font-mono">160 units • Tests WAITING</div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">Task Description / Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Distributed Video Chunk #4"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg text-sm text-white placeholder-slate-500 outline-none transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Workload (Units)</label>
              <input
                type="number"
                min="1"
                max="500"
                value={workload}
                onChange={(e) => setWorkload(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg text-sm font-mono text-white outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg text-sm text-white outline-none cursor-pointer"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold font-display bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Injecting...' : 'Inject into Cluster'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
