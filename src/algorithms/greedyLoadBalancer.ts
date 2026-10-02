import { CloudServer, CloudTask, TaskAssignment, DecisionStep, ServerEvaluation, BalanceResult, AlgorithmicMetrics } from '../types';

/**
 * Calculates server status based on utilization percentage
 */
export function calculateServerStatus(currentLoad: number, capacity: number, isOffline = false): CloudServer['status'] {
  if (isOffline) return 'OFFLINE';
  const util = (currentLoad / capacity) * 100;
  if (util >= 100) return 'OVERLOADED';
  if (util >= 80) return 'NEAR_CAPACITY';
  if (util >= 60) return 'BUSY';
  return 'STABLE';
}

/**
 * Helper to compute algorithmic metrics from server and task states
 */
export function computeMetrics(
  servers: CloudServer[],
  tasks: CloudTask[],
  algoType: 'GREEDY_LINEAR' | 'GREEDY_HEAP' = 'GREEDY_LINEAR'
): AlgorithmicMetrics {
  const onlineServers = servers.filter(s => s.status !== 'OFFLINE');
  const assignedTasks = tasks.filter(t => t.status === 'ASSIGNED').length;
  const waitingTasks = tasks.filter(t => t.status === 'WAITING').length;
  const pendingTasks = tasks.filter(t => t.status === 'PENDING').length;

  const loads = onlineServers.map(s => s.currentLoad);
  const utils = onlineServers.map(s => (s.capacity > 0 ? (s.currentLoad / s.capacity) * 100 : 0));

  const maxLoad = loads.length > 0 ? Math.max(...loads) : 0;
  const minLoad = loads.length > 0 ? Math.min(...loads) : 0;
  const avgLoad = loads.length > 0 ? Math.round((loads.reduce((a, b) => a + b, 0) / loads.length) * 10) / 10 : 0;
  const loadSpread = Math.max(0, maxLoad - minLoad);

  const maxServerUtilization = utils.length > 0 ? Math.round(Math.max(...utils) * 10) / 10 : 0;
  const minServerUtilization = utils.length > 0 ? Math.round(Math.min(...utils) * 10) / 10 : 0;
  const avgServerUtilization = utils.length > 0 ? Math.round((utils.reduce((a, b) => a + b, 0) / utils.length) * 10) / 10 : 0;

  const totalCapacity = servers.reduce((sum, s) => sum + (s.status !== 'OFFLINE' ? s.capacity : 0), 0);
  const totalUsedCapacity = servers.reduce((sum, s) => sum + s.currentLoad, 0);
  const serversUsed = servers.filter(s => s.assignedTaskIds.length > 0).length;

  return {
    totalTasks: tasks.length,
    assignedTasks,
    waitingTasks,
    pendingTasks,
    maxServerUtilization,
    minServerUtilization,
    avgServerUtilization,
    maxLoad,
    minLoad,
    avgLoad,
    loadSpread,
    serversUsed,
    totalCapacity,
    totalUsedCapacity,
    timeComplexity: algoType === 'GREEDY_LINEAR' ? 'O(T × S)' : 'O(T × log S)',
    spaceComplexity: 'O(S + T)',
  };
}

/**
 * Executes a single step of the Greedy Load Balancing algorithm for a specific task.
 * Returns the updated server/task state along with a detailed evaluation trace.
 */
export function evaluateAndAssignTaskGreedy(
  task: CloudTask,
  servers: CloudServer[],
  stepNumber: number,
  algoType: 'GREEDY_LINEAR' | 'GREEDY_HEAP' = 'GREEDY_LINEAR'
): {
  updatedTask: CloudTask;
  updatedServers: CloudServer[];
  assignment: TaskAssignment | null;
  step: DecisionStep;
} {
  // Deep clone servers so input is immutable
  const currentServers: CloudServer[] = servers.map(s => ({
    ...s,
    assignedTaskIds: [...s.assignedTaskIds],
  }));

  const evaluations: ServerEvaluation[] = [];
  let bestCandidateId: string | null = null;
  let minCandidateLoad = Infinity;

  // Evaluate every server
  for (const s of currentServers) {
    const isOffline = s.status === 'OFFLINE';
    const remainingCap = Math.max(0, s.capacity - s.currentLoad);
    const newLoad = s.currentLoad + task.workload;
    const canAccommodate = !isOffline && newLoad <= s.capacity;

    let evalStatus: ServerEvaluation['status'] = 'Candidate';
    let evalReason = '';

    if (isOffline) {
      evalStatus = 'Offline';
      evalReason = 'Node is marked OFFLINE / unreachable';
    } else if (!canAccommodate) {
      evalStatus = 'Rejected';
      evalReason = `Exceeds capacity by ${newLoad - s.capacity} units (${s.currentLoad} + ${task.workload} = ${newLoad} > ${s.capacity})`;
    } else {
      evalStatus = 'Candidate';
      evalReason = `Feasible (Remaining: ${remainingCap} units)`;
      // Greedy heuristic: Lowest current load
      if (s.currentLoad < minCandidateLoad) {
        minCandidateLoad = s.currentLoad;
        bestCandidateId = s.id;
      } else if (s.currentLoad === minCandidateLoad && bestCandidateId !== null) {
        // Tie breaker: pick server with larger remaining capacity
        const currentBest = currentServers.find(srv => srv.id === bestCandidateId);
        if (currentBest && remainingCap > (currentBest.capacity - currentBest.currentLoad)) {
          bestCandidateId = s.id;
        }
      }
    }

    evaluations.push({
      serverId: s.id,
      serverName: s.name,
      currentLoad: s.currentLoad,
      capacity: s.capacity,
      remainingCapacity: remainingCap,
      newLoadIfAssigned: newLoad,
      feasible: canAccommodate,
      status: evalStatus,
      reason: evalReason,
      isSelected: false,
    });
  }

  // Update evaluations with chosen candidate
  let chosenServer: CloudServer | null = null;
  let assignment: TaskAssignment | null = null;
  const updatedTask: CloudTask = { ...task };
  let decisionSummary = '';
  let serverLoadBefore = 0;
  let serverLoadAfter = 0;

  if (bestCandidateId) {
    chosenServer = currentServers.find(s => s.id === bestCandidateId)!;
    serverLoadBefore = chosenServer.currentLoad;
    serverLoadAfter = chosenServer.currentLoad + task.workload;

    for (const ev of evaluations) {
      if (ev.serverId === bestCandidateId) {
        ev.status = 'Candidate ✓';
        ev.isSelected = true;
        ev.reason = `Selected: lowest current load (${serverLoadBefore}/${ev.capacity} units, feasible)`;
      } else if (ev.feasible) {
        ev.reason = `Candidate (load ${ev.currentLoad} > chosen ${serverLoadBefore})`;
      }
    }

    // Apply assignment
    chosenServer.currentLoad += task.workload;
    chosenServer.assignedTaskIds.push(task.id);
    chosenServer.status = calculateServerStatus(chosenServer.currentLoad, chosenServer.capacity);

    updatedTask.status = 'ASSIGNED';
    updatedTask.assignedServerId = chosenServer.id;
    updatedTask.assignedServerName = chosenServer.name;
    updatedTask.assignedAt = new Date().toISOString();
    delete updatedTask.failureReason;

    assignment = {
      id: `assign-${Date.now()}-${task.id}`,
      taskId: task.id,
      taskName: task.name,
      serverId: chosenServer.id,
      serverName: chosenServer.name,
      workload: task.workload,
      assignedAt: updatedTask.assignedAt,
      previousLoad: serverLoadBefore,
      newLoad: serverLoadAfter,
    };

    decisionSummary = `${chosenServer.name} selected because it has the lowest current load (${serverLoadBefore} units) among feasible candidate servers.`;
  } else {
    // No suitable server found
    const allOffline = currentServers.every(s => s.status === 'OFFLINE');
    updatedTask.status = 'WAITING';
    updatedTask.failureReason = allOffline
      ? 'All cloud servers are currently OFFLINE'
      : `No suitable server currently has sufficient capacity for workload of ${task.workload} units`;

    decisionSummary = updatedTask.failureReason;
  }

  const step: DecisionStep = {
    stepNumber,
    task: { ...updatedTask },
    evaluations,
    selectedServerId: chosenServer?.id,
    selectedServerName: chosenServer?.name,
    decisionType: chosenServer
      ? 'ASSIGNED'
      : updatedTask.failureReason?.includes('OFFLINE')
      ? 'UNASSIGNED_OFFLINE'
      : 'UNASSIGNED_NO_CAPACITY',
    decisionSummary,
    timestamp: new Date().toISOString(),
    serverLoadBefore,
    serverLoadAfter,
  };

  return {
    updatedTask,
    updatedServers: currentServers,
    assignment,
    step,
  };
}

/**
 * Min-Heap Priority Queue structure for demonstrating Heap-based Greedy optimization
 */
export class MinServerHeap {
  private heap: { server: CloudServer; key: number }[] = [];

  constructor(servers: CloudServer[]) {
    this.heap = servers
      .filter(s => s.status !== 'OFFLINE')
      .map(s => ({ server: s, key: s.currentLoad }));
    this.buildHeap();
  }

  private buildHeap() {
    for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
      this.heapifyDown(i);
    }
  }

  private heapifyUp(index: number) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[index].key < this.heap[parent].key) {
        const temp = this.heap[index];
        this.heap[index] = this.heap[parent];
        this.heap[parent] = temp;
        index = parent;
      } else {
        break;
      }
    }
  }

  private heapifyDown(index: number) {
    const len = this.heap.length;
    while (index < len) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < len && this.heap[left].key < this.heap[smallest].key) {
        smallest = left;
      }
      if (right < len && this.heap[right].key < this.heap[smallest].key) {
        smallest = right;
      }

      if (smallest !== index) {
        const temp = this.heap[index];
        this.heap[index] = this.heap[smallest];
        this.heap[smallest] = temp;
        index = smallest;
      } else {
        break;
      }
    }
  }

  public extractMin(): CloudServer | null {
    if (this.heap.length === 0) return null;
    const min = this.heap[0].server;
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.heapifyDown(0);
    }
    return min;
  }

  public insert(server: CloudServer) {
    this.heap.push({ server, key: server.currentLoad });
    this.heapifyUp(this.heap.length - 1);
  }
}

/**
 * Executes Greedy Load Balancer over all pending tasks.
 * Calculates before & after metrics, full step logs, and assignments.
 */
export function runGreedyLoadBalancer(
  initialServers: CloudServer[],
  initialTasks: CloudTask[],
  algoType: 'GREEDY_LINEAR' | 'GREEDY_HEAP' = 'GREEDY_LINEAR'
): BalanceResult {
  let servers: CloudServer[] = initialServers.map(s => ({
    ...s,
    assignedTaskIds: [...s.assignedTaskIds],
  }));
  let tasks: CloudTask[] = initialTasks.map(t => ({ ...t }));
  const assignments: TaskAssignment[] = [];
  const steps: DecisionStep[] = [];

  // Snapshot before balancing
  const beforeMetrics = computeMetrics(servers, tasks, algoType);
  const beforeSnapshot = {
    maxLoad: beforeMetrics.maxLoad,
    minLoad: beforeMetrics.minLoad,
    avgLoad: beforeMetrics.avgLoad,
    loadSpread: beforeMetrics.loadSpread,
    serverLoads: servers.map(s => ({
      id: s.id,
      name: s.name,
      load: s.currentLoad,
      utilization: s.capacity > 0 ? Math.round((s.currentLoad / s.capacity) * 100) : 0,
    })),
  };

  // Process only PENDING tasks in order of arrival
  const pendingTasks = tasks.filter(t => t.status === 'PENDING');
  let stepCount = 1;

  for (const task of pendingTasks) {
    const result = evaluateAndAssignTaskGreedy(task, servers, stepCount++, algoType);
    servers = result.updatedServers;
    steps.push(result.step);

    // Update in task list
    const idx = tasks.findIndex(t => t.id === task.id);
    if (idx !== -1) {
      tasks[idx] = result.updatedTask;
    }

    if (result.assignment) {
      assignments.push(result.assignment);
    }
  }

  // After snapshot & metrics
  const afterMetrics = computeMetrics(servers, tasks, algoType);
  const afterSnapshot = {
    maxLoad: afterMetrics.maxLoad,
    minLoad: afterMetrics.minLoad,
    avgLoad: afterMetrics.avgLoad,
    loadSpread: afterMetrics.loadSpread,
    serverLoads: servers.map(s => ({
      id: s.id,
      name: s.name,
      load: s.currentLoad,
      utilization: s.capacity > 0 ? Math.round((s.currentLoad / s.capacity) * 100) : 0,
    })),
  };

  return {
    success: true,
    algorithm: algoType,
    steps,
    servers,
    tasks,
    assignments,
    metrics: afterMetrics,
    beforeSnapshot,
    afterSnapshot,
  };
}
