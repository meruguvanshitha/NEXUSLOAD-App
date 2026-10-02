import React from 'react';
import { Play, Pause, FastForward, RotateCcw, ChevronRight, Zap, CheckCircle2 } from 'lucide-react';

interface SimulationControlsProps {
  isSimulating: boolean;
  isPaused: boolean;
  onStartSimulation: () => void;
  onPauseResume: () => void;
  onStepForward: () => void;
  onSkipToResult: () => void;
  onReset: () => void;
  pendingCount: number;
  totalTasks: number;
  algorithm: 'GREEDY_LINEAR' | 'GREEDY_HEAP';
  setAlgorithm: (algo: 'GREEDY_LINEAR' | 'GREEDY_HEAP') => void;
  simSpeed: number; // in ms
  setSimSpeed: (speed: number) => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isSimulating,
  isPaused,
  onStartSimulation,
  onPauseResume,
  onStepForward,
  onSkipToResult,
  onReset,
  pendingCount,
  totalTasks,
  algorithm,
  setAlgorithm,
  simSpeed,
  setSimSpeed,
}) => {
  return (
    <div className="rounded-xl border border-slate-800/80 bg-[#0C101A]/90 p-4 shadow-xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Main Action Group */}
        <div className="flex flex-wrap items-center gap-2">
          {!isSimulating ? (
            <button
              onClick={onStartSimulation}
              disabled={pendingCount === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm tracking-wide bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-slate-950 hover:brightness-110 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>RUN LIVE SIMULATION</span>
            </button>
          ) : (
            <button
              onClick={onPauseResume}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm tracking-wide border transition-all cursor-pointer ${
                isPaused
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
              }`}
            >
              {isPaused ? <Play className="w-4 h-4 fill-emerald-300" /> : <Pause className="w-4 h-4 fill-amber-300" />}
              <span>{isPaused ? 'RESUME SIMULATION' : 'PAUSE SIMULATION'}</span>
            </button>
          )}

          {/* Step-by-Step button */}
          <button
            onClick={onStepForward}
            disabled={isSimulating && !isPaused || pendingCount === 0}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold font-mono bg-slate-900/90 text-cyan-300 border border-slate-700/80 hover:border-cyan-500/60 hover:bg-cyan-950/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Execute algorithm on next single task"
          >
            <span>Step Forward</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Skip to Result button */}
          <button
            onClick={onSkipToResult}
            disabled={pendingCount === 0}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer disabled:opacity-40"
            title="Instantly balance all pending tasks via algorithm"
          >
            <FastForward className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Skip to Result</span>
          </button>

          {/* Reset Cluster button */}
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 transition-colors cursor-pointer"
            title="Reset server loads and task queue"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Algorithm Strategy & Speed Settings */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          {/* Strategy selector */}
          <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase px-1 font-bold">DAA Engine:</span>
            <button
              onClick={() => setAlgorithm('GREEDY_LINEAR')}
              className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                algorithm === 'GREEDY_LINEAR'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Linear Greedy <span className="text-[10px] text-slate-500">O(T×S)</span>
            </button>
            <button
              onClick={() => setAlgorithm('GREEDY_HEAP')}
              className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                algorithm === 'GREEDY_HEAP'
                  ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Min-Heap <span className="text-[10px] text-slate-500">O(T log S)</span>
            </button>
          </div>

          {/* Speed settings */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] text-slate-400">Speed:</span>
            {[
              { label: '0.5x', ms: 1800 },
              { label: '1x', ms: 900 },
              { label: '2x', ms: 400 },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => setSimSpeed(item.ms)}
                className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer ${
                  simSpeed === item.ms
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Queue tracker */}
          <div className="flex items-center gap-2 text-slate-400">
            <span>Pending:</span>
            <span className={`px-2 py-0.5 rounded font-bold font-mono text-xs ${
              pendingCount > 0 ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-slate-800 text-slate-500'
            }`}>
              {pendingCount} / {totalTasks}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
