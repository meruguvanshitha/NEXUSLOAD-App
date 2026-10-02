import React from 'react';
import { 
  Server, 
  Cpu, 
  Layers, 
  Play, 
  RotateCcw, 
  PlusCircle, 
  Activity,
  Terminal,
  BarChart3,
  Network
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onReset: () => void;
  onOpenInjectModal: () => void;
  pendingCount: number;
  serverCount: number;
  isSimulating: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onReset,
  onOpenInjectModal,
  pendingCount,
  serverCount,
  isSimulating,
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity, desc: 'Cloud State' },
    { id: 'balancer', label: 'Live Balancer', icon: Play, desc: 'DAA Simulation', badge: pendingCount > 0 ? `${pendingCount} new` : undefined },
    { id: 'servers', label: 'Servers', icon: Server, desc: 'Nodes & Limits', count: serverCount },
    { id: 'tasks', label: 'Task Queue', icon: Layers, desc: 'Incoming Jobs' },
    { id: 'scenarios', label: 'Scenario Lab', icon: Cpu, desc: 'Stress Tests' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#080B11]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Identity */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-purple-600/20 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Network className="w-5 h-5 text-cyan-400 animate-pulse" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#080B11]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold tracking-wider text-lg text-white">NEXUS<span className="text-cyan-400">LOAD</span></span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono tracking-tight font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 rounded">DAA ENGINE</span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Intelligent Cloud Task Load Balancer</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>

                  {tab.badge && (
                    <span className="ml-1 px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 text-[10px] font-mono rounded-full border border-cyan-500/30 animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                  {tab.count !== undefined && !tab.badge && (
                    <span className="ml-1 text-[11px] font-mono text-slate-500">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Global Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenInjectModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 hover:border-cyan-600 rounded-lg transition-colors cursor-pointer"
              title="Add a custom computing workload"
            >
              <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Inject Task</span>
            </button>

            <button
              onClick={onReset}
              disabled={isSimulating}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              title="Reset cloud servers & task queues to initial state"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
