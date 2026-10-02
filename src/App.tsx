import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  CloudServer, 
  CloudTask, 
  TaskAssignment, 
  DecisionStep, 
  AlgorithmicMetrics, 
  ScenarioType,
  MongooseAuditEntry
} from './types';
import { 
  fetchDashboard, 
  executeBalance, 
  executeBalanceStep, 
  resetCluster, 
  updateServer, 
  createTask, 
  deleteTask, 
  loadScenario 
} from './services/api';
import { computeMetrics, runGreedyLoadBalancer, evaluateAndAssignTaskGreedy } from './algorithms/greedyLoadBalancer';
import { generateMongooseLogsForStep } from './utils/mongooseAudit';
import { Navbar } from './components/Navbar';
import { InjectTaskModal } from './components/InjectTaskModal';
import { OverviewView } from './pages/OverviewView';
import { LiveBalancerView } from './pages/LiveBalancerView';
import { ServersView } from './pages/ServersView';
import { TaskQueueView } from './pages/TaskQueueView';
import { ScenarioLabView } from './pages/ScenarioLabView';
import { INITIAL_SERVERS, INITIAL_TASKS } from './server/db';
import { Terminal, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [servers, setServers] = useState<CloudServer[]>(INITIAL_SERVERS);
  const [tasks, setTasks] = useState<CloudTask[]>(INITIAL_TASKS);
  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
  const [currentScenario, setCurrentScenario] = useState<ScenarioType>('BALANCED_CLOUD');
  
  const [currentStep, setCurrentStep] = useState<DecisionStep | null>(null);
  const [selectedServerId, setSelectedServerId] = useState<string | undefined>(undefined);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  
  // Real-time Mongoose Audit Trail
  const [auditLogs, setAuditLogs] = useState<MongooseAuditEntry[]>([
    {
      id: 'init-1',
      timestamp: new Date().toISOString(),
      timeFormatted: new Date().toLocaleTimeString(),
      collectionName: 'servers',
      method: 'find',
      operation: 'Server.find({ status: { $ne: "OFFLINE" } }).sort({ currentLoad: 1 })',
      documentId: 'system',
      payload: { filter: { status: { $ne: 'OFFLINE' } } },
      durationMs: 3,
      status: 'SUCCESS',
      detail: 'Initialized MongoDB connection pool (5 cluster nodes indexed)',
    },
    {
      id: 'init-2',
      timestamp: new Date().toISOString(),
      timeFormatted: new Date().toLocaleTimeString(),
      collectionName: 'tasks',
      method: 'find',
      operation: 'Task.find({ status: "PENDING" }).sort({ arrivalTime: 1 })',
      documentId: 'system',
      payload: { status: 'PENDING' },
      durationMs: 2,
      status: 'SUCCESS',
      detail: 'Hydrated incoming workload queue from MongoDB tasks collection (12 documents loaded)',
    },
  ]);

  // Simulation states
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(900); // 900ms normal
  const [algorithm, setAlgorithm] = useState<'GREEDY_LINEAR' | 'GREEDY_HEAP'>('GREEDY_LINEAR');
  
  // Modals & UI
  const [isInjectModalOpen, setIsInjectModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'warning' } | null>(null);

  // References for live simulation interval
  const simulationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSimulatingRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);

  useEffect(() => {
    isSimulatingRef.current = isSimulating;
  }, [isSimulating]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Toast auto-clear
  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 3500);
      return () => clearTimeout(t);
    }
  }, [notification]);

  // Initial load from backend API
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchDashboard();
      setServers(data.servers);
      setTasks(data.tasks);
      setAssignments(data.assignments);
      setCurrentScenario(data.currentScenario || 'BALANCED_CLOUD');
    } catch (err: any) {
      console.warn('API fetch initial dashboard warning, using initial cluster seed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Execute a single step of the greedy algorithm
  const performStep = useCallback(async (): Promise<boolean> => {
    try {
      setIsEvaluating(true);
      const res = await executeBalanceStep(algorithm);
      
      if (res.finished) {
        setIsSimulating(false);
        setIsEvaluating(false);
        setSelectedServerId(undefined);
        setNotification({ message: 'All pending tasks have been processed by Greedy Balancer', type: 'success' });
        return false;
      }

      if (res.step) {
        setCurrentStep(res.step);
        setSelectedServerId(res.step.selectedServerId);
        setServers(res.servers);
        setTasks(res.tasks);
        if (res.assignment) {
          setAssignments(prev => [res.assignment!, ...prev]);
        }

        // Generate Mongoose audit logs for this step
        const chosen = res.servers.find(s => s.id === res.step!.selectedServerId) || null;
        const newLogs = generateMongooseLogsForStep(
          res.step.task, 
          chosen, 
          res.assignment || null, 
          res.step.serverLoadBefore
        );
        setAuditLogs(prev => [...newLogs, ...prev].slice(0, 100));
      }

      setIsEvaluating(false);
      return true;
    } catch (err: any) {
      console.error('Error in step execution:', err);
      // Fallback local step execution
      const pendingTask = tasks.find(t => t.status === 'PENDING');
      if (!pendingTask) {
        setIsSimulating(false);
        setIsEvaluating(false);
        return false;
      }
      const stepNum = tasks.filter(t => t.status !== 'PENDING').length + 1;
      const stepRes = evaluateAndAssignTaskGreedy(pendingTask, servers, stepNum, algorithm);
      setCurrentStep(stepRes.step);
      setSelectedServerId(stepRes.step.selectedServerId);
      setServers(stepRes.updatedServers);
      setTasks(prev => prev.map(t => t.id === pendingTask.id ? stepRes.updatedTask : t));
      if (stepRes.assignment) {
        setAssignments(prev => [stepRes.assignment!, ...prev]);
      }

      const chosen = stepRes.updatedServers.find(s => s.id === stepRes.step.selectedServerId) || null;
      const newLogs = generateMongooseLogsForStep(
        stepRes.step.task,
        chosen,
        stepRes.assignment,
        stepRes.step.serverLoadBefore
      );
      setAuditLogs(prev => [...newLogs, ...prev].slice(0, 100));

      setIsEvaluating(false);
      return true;
    }
  }, [algorithm, servers, tasks]);

  // Live simulation loop
  const runSimulationLoop = useCallback(async () => {
    if (!isSimulatingRef.current || isPausedRef.current) return;

    const hasMore = await performStep();
    if (hasMore && isSimulatingRef.current && !isPausedRef.current) {
      simulationTimeoutRef.current = setTimeout(runSimulationLoop, simSpeed);
    }
  }, [performStep, simSpeed]);

  const handleStartSimulation = () => {
    if (tasks.filter(t => t.status === 'PENDING').length === 0) {
      setNotification({ message: 'No pending tasks left to balance. Click "Reset" to restart with fresh queue.', type: 'info' });
      return;
    }
    setIsSimulating(true);
    setIsPaused(false);
    isSimulatingRef.current = true;
    isPausedRef.current = false;
    runSimulationLoop();
  };

  const handlePauseResume = () => {
    if (isPaused) {
      setIsPaused(false);
      isPausedRef.current = false;
      runSimulationLoop();
    } else {
      setIsPaused(true);
      isPausedRef.current = true;
      if (simulationTimeoutRef.current) {
        clearTimeout(simulationTimeoutRef.current);
      }
    }
  };

  const handleStepForward = () => {
    if (isSimulating && !isPaused) return;
    performStep();
  };

  const handleSkipToResult = async (algoToUse?: 'GREEDY_LINEAR' | 'GREEDY_HEAP') => {
    const algo = algoToUse || algorithm;
    try {
      setIsLoading(true);
      if (simulationTimeoutRef.current) {
        clearTimeout(simulationTimeoutRef.current);
      }
      setIsSimulating(false);
      setIsPaused(false);

      const result = await executeBalance(algo);
      setServers(result.servers);
      setTasks(result.tasks);
      setAssignments(prev => [...result.assignments, ...prev]);
      
      if (result.steps.length > 0) {
        setCurrentStep(result.steps[result.steps.length - 1]);
        setSelectedServerId(result.steps[result.steps.length - 1].selectedServerId);

        // Generate batch Mongoose audit log entries
        const batchLogs: MongooseAuditEntry[] = [];
        for (const step of result.steps) {
          const chosen = result.servers.find(s => s.id === step.selectedServerId) || null;
          const assign = result.assignments.find(a => a.taskId === step.task.id) || null;
          batchLogs.push(...generateMongooseLogsForStep(step.task, chosen, assign, step.serverLoadBefore));
        }
        setAuditLogs(prev => [...batchLogs, ...prev].slice(0, 100));
      }

      setNotification({ 
        message: `Batch balanced ${result.steps.length} tasks via ${algo === 'GREEDY_LINEAR' ? 'Linear Greedy' : 'Min-Heap'}`, 
        type: 'success' 
      });
    } catch (err: any) {
      // Local fallback
      const localResult = runGreedyLoadBalancer(servers, tasks, algo);
      setServers(localResult.servers);
      setTasks(localResult.tasks);
      setAssignments(prev => [...localResult.assignments, ...prev]);
      
      if (localResult.steps.length > 0) {
        setCurrentStep(localResult.steps[localResult.steps.length - 1]);
        setSelectedServerId(localResult.steps[localResult.steps.length - 1].selectedServerId);

        const batchLogs: MongooseAuditEntry[] = [];
        for (const step of localResult.steps) {
          const chosen = localResult.servers.find(s => s.id === step.selectedServerId) || null;
          const assign = localResult.assignments.find(a => a.taskId === step.task.id) || null;
          batchLogs.push(...generateMongooseLogsForStep(step.task, chosen, assign, step.serverLoadBefore));
        }
        setAuditLogs(prev => [...batchLogs, ...prev].slice(0, 100));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLaunchLiveBalancer = () => {
    setCurrentTab('balancer');
    const hasPending = tasks.some(t => t.status === 'PENDING');
    if (hasPending) {
      setIsSimulating(true);
      setIsPaused(false);
      isSimulatingRef.current = true;
      isPausedRef.current = false;
      setTimeout(() => {
        runSimulationLoop();
      }, 300);
      setNotification({ message: 'Live Balancer simulation initiated', type: 'info' });
    }
  };

  const handleQuickBalance = () => {
    handleSkipToResult(algorithm);
  };

  const handleReset = async () => {
    if (simulationTimeoutRef.current) {
      clearTimeout(simulationTimeoutRef.current);
    }
    setIsSimulating(false);
    setIsPaused(false);
    setCurrentStep(null);
    setSelectedServerId(undefined);

    try {
      setIsLoading(true);
      const res = await resetCluster();
      setServers(res.servers);
      setTasks(res.tasks);
      setAssignments([]);
      setNotification({ message: 'Cloud cluster reset to initial seed state', type: 'info' });
      
      const resetEntry: MongooseAuditEntry = {
        id: `reset-${Date.now()}`,
        timestamp: new Date().toISOString(),
        timeFormatted: new Date().toLocaleTimeString(),
        collectionName: 'servers',
        method: 'updateOne',
        operation: 'db.dropDatabase(); // Reset cluster seed to baseline state',
        documentId: 'cluster',
        payload: { action: 'CLUSTER_RESET' },
        durationMs: 4,
        status: 'SUCCESS',
        detail: 'Database collections reset: tasks (12 pending), servers (5 baseline nodes)',
      };
      setAuditLogs(prev => [resetEntry, ...prev].slice(0, 100));
    } catch (err) {
      setServers(INITIAL_SERVERS);
      setTasks(INITIAL_TASKS);
      setAssignments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleOffline = async (id: string, currentStatus: CloudServer['status']) => {
    const newStatus = currentStatus === 'OFFLINE' ? 'STABLE' : 'OFFLINE';
    try {
      const updated = await updateServer(id, { status: newStatus });
      setServers(prev => prev.map(s => s.id === id ? updated : s));
      setNotification({ 
        message: `${updated.name} is now ${newStatus}`, 
        type: newStatus === 'OFFLINE' ? 'warning' : 'success' 
      });

      const nodeEntry: MongooseAuditEntry = {
        id: `node-${Date.now()}`,
        timestamp: new Date().toISOString(),
        timeFormatted: new Date().toLocaleTimeString(),
        collectionName: 'servers',
        method: 'findByIdAndUpdate',
        operation: `Server.findByIdAndUpdate("${id}", { $set: { status: "${newStatus}" } }, { new: true })`,
        documentId: id,
        payload: { status: newStatus },
        durationMs: 2,
        status: 'SUCCESS',
        detail: `Node ${updated.name} status updated -> ${newStatus}`,
      };
      setAuditLogs(prev => [nodeEntry, ...prev].slice(0, 100));
    } catch (err: any) {
      setServers(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    }
  };

  const handleAdjustCapacity = async (id: string, newCap: number) => {
    try {
      const updated = await updateServer(id, { capacity: newCap });
      setServers(prev => prev.map(s => s.id === id ? updated : s));
      
      const capEntry: MongooseAuditEntry = {
        id: `cap-${Date.now()}`,
        timestamp: new Date().toISOString(),
        timeFormatted: new Date().toLocaleTimeString(),
        collectionName: 'servers',
        method: 'findByIdAndUpdate',
        operation: `Server.findByIdAndUpdate("${id}", { $set: { capacity: ${newCap} } }, { new: true })`,
        documentId: id,
        payload: { capacity: newCap },
        durationMs: 2,
        status: 'SUCCESS',
        detail: `Node ${updated.name} capacity ceiling resized -> ${newCap} units`,
      };
      setAuditLogs(prev => [capEntry, ...prev].slice(0, 100));
    } catch (err) {
      setServers(prev => prev.map(s => s.id === id ? { ...s, capacity: newCap } : s));
    }
  };

  const handleInjectTask = async (taskData: { name: string; workload: number; priority: CloudTask['priority'] }) => {
    try {
      const newTask = await createTask(taskData);
      setTasks(prev => [...prev, newTask]);
      setNotification({ message: `Injected '${newTask.name}' (${newTask.workload}u) into queue`, type: 'success' });
      
      const taskCreateEntry: MongooseAuditEntry = {
        id: `task-create-${Date.now()}`,
        timestamp: new Date().toISOString(),
        timeFormatted: new Date().toLocaleTimeString(),
        collectionName: 'tasks',
        method: 'create',
        operation: `Task.create({ name: "${newTask.name}", workload: ${newTask.workload}, status: "PENDING", priority: "${newTask.priority}" })`,
        documentId: newTask.id,
        payload: newTask,
        durationMs: 3,
        status: 'SUCCESS',
        detail: `Inserted new workload document into tasks collection`,
      };
      setAuditLogs(prev => [taskCreateEntry, ...prev].slice(0, 100));
    } catch (err: any) {
      const localTask: CloudTask = {
        id: `tsk-${Date.now().toString(36)}`,
        name: taskData.name,
        workload: taskData.workload,
        arrivalTime: new Date().toTimeString().split(' ')[0],
        status: 'PENDING',
        priority: taskData.priority,
      };
      setTasks(prev => [...prev, localTask]);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      setNotification({ message: `Task removed from queue`, type: 'info' });
    } catch (err) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleSelectScenario = async (scenarioId: ScenarioType) => {
    if (simulationTimeoutRef.current) {
      clearTimeout(simulationTimeoutRef.current);
    }
    setIsSimulating(false);
    setIsPaused(false);
    setCurrentStep(null);
    setSelectedServerId(undefined);

    try {
      setIsLoading(true);
      const res = await loadScenario(scenarioId);
      setCurrentScenario(scenarioId);
      setServers(res.servers);
      setTasks(res.tasks);
      setAssignments([]);
      setNotification({ message: `Loaded Scenario: ${res.scenario.title}`, type: 'info' });
      
      const scEntry: MongooseAuditEntry = {
        id: `scenario-${Date.now()}`,
        timestamp: new Date().toISOString(),
        timeFormatted: new Date().toLocaleTimeString(),
        collectionName: 'servers',
        method: 'find',
        operation: `db.tasks.deleteMany({}); db.tasks.insertMany([...${scenarioId}_TASKS]);`,
        documentId: scenarioId,
        payload: { scenario: scenarioId },
        durationMs: 5,
        status: 'SUCCESS',
        detail: `Scenario ${scenarioId} loaded: ${res.tasks.length} tasks ready for balancing`,
      };
      setAuditLogs(prev => [scEntry, ...prev].slice(0, 100));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunScenarioBalancing = async (algo: 'GREEDY_LINEAR' | 'GREEDY_HEAP') => {
    setAlgorithm(algo);
    const hasPending = tasks.some(t => t.status === 'PENDING');
    
    if (!hasPending) {
      // Reload scenario data first so pending tasks exist, then execute
      try {
        setIsLoading(true);
        const res = await loadScenario(currentScenario);
        setServers(res.servers);
        setTasks(res.tasks);
        setAssignments([]);
        
        // Execute balancing
        const result = await executeBalance(algo);
        setServers(result.servers);
        setTasks(result.tasks);
        setAssignments(result.assignments);
        
        if (result.steps.length > 0) {
          setCurrentStep(result.steps[result.steps.length - 1]);
          setSelectedServerId(result.steps[result.steps.length - 1].selectedServerId);

          const batchLogs: MongooseAuditEntry[] = [];
          for (const step of result.steps) {
            const chosen = result.servers.find(s => s.id === step.selectedServerId) || null;
            const assign = result.assignments.find(a => a.taskId === step.task.id) || null;
            batchLogs.push(...generateMongooseLogsForStep(step.task, chosen, assign, step.serverLoadBefore));
          }
          setAuditLogs(prev => [...batchLogs, ...prev].slice(0, 100));
        }

        setNotification({ 
          message: `Re-ran scenario balancing with ${algo === 'GREEDY_LINEAR' ? 'Linear Scan' : 'Min-Heap'}`, 
          type: 'success' 
        });
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    } else {
      await handleSkipToResult(algo);
    }
  };

  const metrics = computeMetrics(servers, tasks, algorithm);
  const pendingCount = tasks.filter(t => t.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onReset={handleReset}
        onOpenInjectModal={() => setIsInjectModalOpen(true)}
        pendingCount={pendingCount}
        serverCount={servers.length}
        isSimulating={isSimulating}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'overview' && (
          <OverviewView
            servers={servers}
            tasks={tasks}
            assignments={assignments}
            metrics={metrics}
            auditLogs={auditLogs}
            onClearAuditLogs={() => setAuditLogs([])}
            onNavigateToBalancer={() => setCurrentTab('balancer')}
            onLaunchLiveBalancer={handleLaunchLiveBalancer}
            onQuickBalance={handleQuickBalance}
            onToggleOffline={handleToggleOffline}
          />
        )}

        {currentTab === 'balancer' && (
          <LiveBalancerView
            servers={servers}
            tasks={tasks}
            currentStep={currentStep}
            isSimulating={isSimulating}
            isPaused={isPaused}
            onStartSimulation={handleStartSimulation}
            onPauseResume={handlePauseResume}
            onStepForward={handleStepForward}
            onSkipToResult={() => handleSkipToResult(algorithm)}
            onReset={handleReset}
            algorithm={algorithm}
            setAlgorithm={setAlgorithm}
            simSpeed={simSpeed}
            setSimSpeed={setSimSpeed}
            selectedServerId={selectedServerId}
            isEvaluating={isEvaluating}
          />
        )}

        {currentTab === 'servers' && (
          <ServersView
            servers={servers}
            tasks={tasks}
            onToggleOffline={handleToggleOffline}
            onAdjustCapacity={handleAdjustCapacity}
          />
        )}

        {currentTab === 'tasks' && (
          <TaskQueueView
            tasks={tasks}
            onOpenInjectModal={() => setIsInjectModalOpen(true)}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {currentTab === 'scenarios' && (
          <ScenarioLabView
            currentScenario={currentScenario}
            onSelectScenario={handleSelectScenario}
            onRunBalancing={handleRunScenarioBalancing}
            servers={servers}
            tasks={tasks}
            metrics={metrics}
            isLoading={isLoading}
          />
        )}
      </main>

      {/* Custom Task Injection Modal */}
      <InjectTaskModal
        isOpen={isInjectModalOpen}
        onClose={() => setIsInjectModalOpen(false)}
        onInject={handleInjectTask}
      />

      {/* Global Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-[#0C1220]/95 backdrop-blur-md shadow-2xl text-xs font-mono transition-all animate-bounce">
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : notification.type === 'warning' ? (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
          )}
          <span className="text-slate-200">{notification.message}</span>
        </div>
      )}

      {/* Bottom Footer */}
      <footer className="border-t border-slate-800/80 bg-[#080B11] py-4 text-xs font-mono text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="text-slate-400 font-semibold">NEXUSLOAD</span> • DAA Hackathon Project: Cloud Task Load Balancer
          </div>
          <div className="text-[11px] text-slate-500">
            Strategy: Greedy Load Scheduling • O(T × S) Linear / O(T log S) Min-Heap • MongoDB Mongoose ODM
          </div>
        </div>
      </footer>
    </div>
  );
}
