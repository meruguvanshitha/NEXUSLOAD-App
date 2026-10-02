export type ServerStatus = 'STABLE' | 'BUSY' | 'NEAR_CAPACITY' | 'OVERLOADED' | 'OFFLINE';

export interface CloudServer {
  id: string;
  name: string;
  region: string;
  capacity: number;
  currentLoad: number;
  initialLoad: number;
  status: ServerStatus;
  assignedTaskIds: string[];
  specs: {
    cpuCores: number;
    ramGb: number;
    tier: string;
  };
}

export type TaskStatus = 'PENDING' | 'ASSIGNED' | 'WAITING';

export interface CloudTask {
  id: string;
  name: string;
  workload: number;
  arrivalTime: string;
  status: TaskStatus;
  assignedServerId?: string;
  assignedServerName?: string;
  assignedAt?: string;
  failureReason?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  taskName: string;
  serverId: string;
  serverName: string;
  workload: number;
  assignedAt: string;
  previousLoad: number;
  newLoad: number;
}

export interface MongooseAuditEntry {
  id: string;
  timestamp: string;
  timeFormatted: string;
  operation: string; // e.g. "Task.findByIdAndUpdate", "Server.findByIdAndUpdate", "AuditLog.create"
  collectionName: 'tasks' | 'servers' | 'audit_logs';
  method: 'findByIdAndUpdate' | 'create' | 'updateOne' | 'find';
  documentId: string;
  payload: Record<string, any>;
  durationMs: number;
  status: 'SUCCESS' | 'WAITING_CAPACITY' | 'REJECTED';
  detail: string;
}

export interface ServerEvaluation {
  serverId: string;
  serverName: string;
  currentLoad: number;
  capacity: number;
  remainingCapacity: number;
  newLoadIfAssigned: number;
  feasible: boolean;
  status: 'Candidate' | 'Candidate ✓' | 'Rejected' | 'Offline';
  reason: string;
  isSelected: boolean;
}

export interface DecisionStep {
  stepNumber: number;
  task: CloudTask;
  evaluations: ServerEvaluation[];
  selectedServerId?: string;
  selectedServerName?: string;
  decisionType: 'ASSIGNED' | 'UNASSIGNED_NO_CAPACITY' | 'UNASSIGNED_OFFLINE';
  decisionSummary: string;
  timestamp: string;
  serverLoadBefore: number;
  serverLoadAfter: number;
}

export interface BalanceResult {
  success: boolean;
  algorithm: 'GREEDY_LINEAR' | 'GREEDY_HEAP';
  steps: DecisionStep[];
  servers: CloudServer[];
  tasks: CloudTask[];
  assignments: TaskAssignment[];
  metrics: AlgorithmicMetrics;
  beforeSnapshot: {
    maxLoad: number;
    minLoad: number;
    avgLoad: number;
    loadSpread: number;
    serverLoads: { id: string; name: string; load: number; utilization: number }[];
  };
  afterSnapshot: {
    maxLoad: number;
    minLoad: number;
    avgLoad: number;
    loadSpread: number;
    serverLoads: { id: string; name: string; load: number; utilization: number }[];
  };
}

export interface AlgorithmicMetrics {
  totalTasks: number;
  assignedTasks: number;
  waitingTasks: number;
  pendingTasks: number;
  maxServerUtilization: number; // percentage
  minServerUtilization: number; // percentage
  avgServerUtilization: number; // percentage
  maxLoad: number;
  minLoad: number;
  avgLoad: number;
  loadSpread: number; // maxLoad - minLoad
  serversUsed: number;
  totalCapacity: number;
  totalUsedCapacity: number;
  timeComplexity: string;
  spaceComplexity: string;
}

export type ScenarioType = 'BALANCED_CLOUD' | 'HEAVY_TRAFFIC' | 'NEAR_CAPACITY' | 'RESOURCE_SHORTAGE';

export interface ScenarioDefinition {
  id: ScenarioType;
  title: string;
  description: string;
  expectedOutcome: string;
  servers: Omit<CloudServer, 'assignedTaskIds'>[];
  tasks: Omit<CloudTask, 'status' | 'assignedServerId' | 'assignedServerName' | 'assignedAt'>[];
}
