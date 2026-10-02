import { CloudServer, CloudTask, TaskAssignment, ScenarioType, ScenarioDefinition } from '../types';
import { calculateServerStatus } from '../algorithms/greedyLoadBalancer';

// Default Seed Servers
export const INITIAL_SERVERS: CloudServer[] = [
  {
    id: 'srv-01',
    name: 'SERVER-01 (US-East Alpha)',
    region: 'us-east-1',
    capacity: 100,
    currentLoad: 45,
    initialLoad: 45,
    status: 'STABLE',
    assignedTaskIds: [],
    specs: { cpuCores: 16, ramGb: 64, tier: 'Compute Optimized' },
  },
  {
    id: 'srv-02',
    name: 'SERVER-02 (US-West Beta)',
    region: 'us-west-2',
    capacity: 120,
    currentLoad: 50,
    initialLoad: 50,
    status: 'STABLE',
    assignedTaskIds: [],
    specs: { cpuCores: 24, ramGb: 96, tier: 'High Memory' },
  },
  {
    id: 'srv-03',
    name: 'SERVER-03 (EU-Central Gamma)',
    region: 'eu-central-1',
    capacity: 80,
    currentLoad: 20,
    initialLoad: 20,
    status: 'STABLE',
    assignedTaskIds: [],
    specs: { cpuCores: 8, ramGb: 32, tier: 'General Purpose' },
  },
  {
    id: 'srv-04',
    name: 'SERVER-04 (AP-South Delta)',
    region: 'ap-south-1',
    capacity: 150,
    currentLoad: 75,
    initialLoad: 75,
    status: 'BUSY',
    assignedTaskIds: [],
    specs: { cpuCores: 32, ramGb: 128, tier: 'GPU Accelerated' },
  },
  {
    id: 'srv-05',
    name: 'SERVER-05 (SA-East Epsilon)',
    region: 'sa-east-1',
    capacity: 90,
    currentLoad: 35,
    initialLoad: 35,
    status: 'STABLE',
    assignedTaskIds: [],
    specs: { cpuCores: 12, ramGb: 48, tier: 'Storage Optimized' },
  },
];

// Default Seed Tasks
export const INITIAL_TASKS: CloudTask[] = [
  {
    id: 'tsk-101',
    name: 'Video Transcoding Pipeline',
    workload: 30,
    arrivalTime: '10:00:01',
    status: 'PENDING',
    priority: 'HIGH',
  },
  {
    id: 'tsk-102',
    name: 'Database Index Optimization',
    workload: 20,
    arrivalTime: '10:00:04',
    status: 'PENDING',
    priority: 'MEDIUM',
  },
  {
    id: 'tsk-103',
    name: 'ML Batch Model Inference',
    workload: 45,
    arrivalTime: '10:00:07',
    status: 'PENDING',
    priority: 'HIGH',
  },
  {
    id: 'tsk-104',
    name: 'SSL/TLS Handshake Session Pool',
    workload: 12,
    arrivalTime: '10:00:10',
    status: 'PENDING',
    priority: 'LOW',
  },
  {
    id: 'tsk-105',
    name: 'Realtime Log Aggregator Stream',
    workload: 25,
    arrivalTime: '10:00:14',
    status: 'PENDING',
    priority: 'MEDIUM',
  },
  {
    id: 'tsk-106',
    name: 'Ray-Tracing Frame Render',
    workload: 35,
    arrivalTime: '10:00:18',
    status: 'PENDING',
    priority: 'HIGH',
  },
  {
    id: 'tsk-107',
    name: 'Microservice RPC Gateway Sync',
    workload: 15,
    arrivalTime: '10:00:22',
    status: 'PENDING',
    priority: 'LOW',
  },
  {
    id: 'tsk-108',
    name: 'Distributed Geo-Replication ETL',
    workload: 40,
    arrivalTime: '10:00:25',
    status: 'PENDING',
    priority: 'HIGH',
  },
  {
    id: 'tsk-109',
    name: 'High-Throughput Kafka Ingestion',
    workload: 28,
    arrivalTime: '10:00:29',
    status: 'PENDING',
    priority: 'MEDIUM',
  },
  {
    id: 'tsk-110',
    name: 'Massive Monolith Analytics Query',
    workload: 70,
    arrivalTime: '10:00:33',
    status: 'PENDING',
    priority: 'CRITICAL',
  },
  {
    id: 'tsk-111',
    name: 'Redis Cache Warmup & Hydration',
    workload: 18,
    arrivalTime: '10:00:37',
    status: 'PENDING',
    priority: 'LOW',
  },
  {
    id: 'tsk-112',
    name: 'Extreme Disaster Recovery Sync',
    workload: 180,
    arrivalTime: '10:00:41',
    status: 'PENDING',
    priority: 'CRITICAL',
  },
];

// Predefined Scenarios
export const PREDEFINED_SCENARIOS: Record<ScenarioType, ScenarioDefinition> = {
  BALANCED_CLOUD: {
    id: 'BALANCED_CLOUD',
    title: 'Balanced Cloud Environment',
    description: 'Standard multi-region cloud cluster with heterogeneous capacities and healthy distribution headroom.',
    expectedOutcome: 'Greedy balancer will evenly distribute workloads across lowest-loaded nodes, minimizing load spread.',
    servers: [
      { id: 'srv-01', name: 'SERVER-01 (US-East)', region: 'us-east-1', capacity: 100, currentLoad: 30, initialLoad: 30, status: 'STABLE', specs: { cpuCores: 16, ramGb: 64, tier: 'General' } },
      { id: 'srv-02', name: 'SERVER-02 (US-West)', region: 'us-west-2', capacity: 120, currentLoad: 40, initialLoad: 40, status: 'STABLE', specs: { cpuCores: 24, ramGb: 96, tier: 'Compute' } },
      { id: 'srv-03', name: 'SERVER-03 (EU-Central)', region: 'eu-central-1', capacity: 90, currentLoad: 25, initialLoad: 25, status: 'STABLE', specs: { cpuCores: 16, ramGb: 64, tier: 'General' } },
      { id: 'srv-04', name: 'SERVER-04 (AP-South)', region: 'ap-south-1', capacity: 110, currentLoad: 35, initialLoad: 35, status: 'STABLE', specs: { cpuCores: 16, ramGb: 64, tier: 'Memory' } },
    ],
    tasks: [
      { id: 'sc1-01', name: 'Web Traffic Load', workload: 20, arrivalTime: '11:00:00', priority: 'MEDIUM' },
      { id: 'sc1-02', name: 'API Auth Gateway', workload: 15, arrivalTime: '11:00:03', priority: 'LOW' },
      { id: 'sc1-03', name: 'Search Indexer', workload: 25, arrivalTime: '11:00:06', priority: 'MEDIUM' },
      { id: 'sc1-04', name: 'Image Compression', workload: 30, arrivalTime: '11:00:10', priority: 'HIGH' },
      { id: 'sc1-05', name: 'Payment Webhook', workload: 12, arrivalTime: '11:00:12', priority: 'HIGH' },
      { id: 'sc1-06', name: 'Nightly Sync Batch', workload: 28, arrivalTime: '11:00:15', priority: 'MEDIUM' },
    ],
  },
  HEAVY_TRAFFIC: {
    id: 'HEAVY_TRAFFIC',
    title: 'Heavy Traffic Spike',
    description: 'High burst of demanding computing tasks arriving in rapid succession. Tests candidate load tracking and peak load mitigation.',
    expectedOutcome: 'Nodes quickly transition from Stable to Busy/Near Capacity; greedy strategy keeps max load as low as possible.',
    servers: [
      { id: 'srv-01', name: 'SERVER-01 (Alpha Core)', region: 'us-east-1', capacity: 100, currentLoad: 50, initialLoad: 50, status: 'STABLE', specs: { cpuCores: 16, ramGb: 64, tier: 'Compute' } },
      { id: 'srv-02', name: 'SERVER-02 (Beta Core)', region: 'us-west-2', capacity: 120, currentLoad: 55, initialLoad: 55, status: 'STABLE', specs: { cpuCores: 24, ramGb: 96, tier: 'Compute' } },
      { id: 'srv-03', name: 'SERVER-03 (Gamma Core)', region: 'eu-west-1', capacity: 80, currentLoad: 40, initialLoad: 40, status: 'STABLE', specs: { cpuCores: 8, ramGb: 32, tier: 'Standard' } },
      { id: 'srv-04', name: 'SERVER-04 (Delta Core)', region: 'ap-east-1', capacity: 140, currentLoad: 65, initialLoad: 65, status: 'STABLE', specs: { cpuCores: 32, ramGb: 128, tier: 'Heavy' } },
    ],
    tasks: [
      { id: 'ht-01', name: '4K Video Transcoding', workload: 45, arrivalTime: '12:00:01', priority: 'HIGH' },
      { id: 'ht-02', name: 'GenAI Inference Run', workload: 50, arrivalTime: '12:00:03', priority: 'CRITICAL' },
      { id: 'ht-03', name: 'Financial Model Backtest', workload: 35, arrivalTime: '12:00:05', priority: 'HIGH' },
      { id: 'ht-04', name: 'Database Re-clustering', workload: 40, arrivalTime: '12:00:08', priority: 'MEDIUM' },
      { id: 'ht-05', name: 'Deep Neural Net Evaluation', workload: 48, arrivalTime: '12:00:11', priority: 'CRITICAL' },
    ],
  },
  NEAR_CAPACITY: {
    id: 'NEAR_CAPACITY',
    title: 'Near Capacity Critical Boundary',
    description: 'Cloud servers operating at 75%–90% capacity. Tests the capacity ceiling filter: servers with insufficient remaining space MUST be rejected.',
    expectedOutcome: 'Heavily loaded servers are identified and rejected as non-candidates; tasks only route to nodes with remaining headroom.',
    servers: [
      { id: 'srv-01', name: 'SERVER-01 (US-East)', region: 'us-east-1', capacity: 100, currentLoad: 88, initialLoad: 88, status: 'NEAR_CAPACITY', specs: { cpuCores: 16, ramGb: 64, tier: 'Compute' } },
      { id: 'srv-02', name: 'SERVER-02 (US-West)', region: 'us-west-2', capacity: 120, currentLoad: 110, initialLoad: 110, status: 'NEAR_CAPACITY', specs: { cpuCores: 24, ramGb: 96, tier: 'Compute' } },
      { id: 'srv-03', name: 'SERVER-03 (EU-Central)', region: 'eu-central-1', capacity: 80, currentLoad: 55, initialLoad: 55, status: 'BUSY', specs: { cpuCores: 8, ramGb: 32, tier: 'Standard' } },
      { id: 'srv-04', name: 'SERVER-04 (AP-South)', region: 'ap-south-1', capacity: 150, currentLoad: 135, initialLoad: 135, status: 'NEAR_CAPACITY', specs: { cpuCores: 32, ramGb: 128, tier: 'Heavy' } },
    ],
    tasks: [
      { id: 'nc-01', name: 'Light Session Ping', workload: 8, arrivalTime: '13:00:01', priority: 'LOW' },
      { id: 'nc-02', name: 'Mid ETL Transform', workload: 18, arrivalTime: '13:00:04', priority: 'MEDIUM' },
      { id: 'nc-03', name: 'Large Docker Build', workload: 25, arrivalTime: '13:00:07', priority: 'HIGH' },
      { id: 'nc-04', name: 'Heavy MapReduce Phase', workload: 35, arrivalTime: '13:00:10', priority: 'HIGH' },
    ],
  },
  RESOURCE_SHORTAGE: {
    id: 'RESOURCE_SHORTAGE',
    title: 'Resource Shortage & Capacity Exhaustion',
    description: 'Total task demand exceeds total remaining cluster capacity. Tests graceful handling of unassignable tasks entering WAITING state.',
    expectedOutcome: 'Tasks that cannot fit on any server are marked WAITING with clear diagnostic reason rather than crashing or overflowing nodes.',
    servers: [
      { id: 'srv-01', name: 'SERVER-01 (Edge Node A)', region: 'us-east-1', capacity: 60, currentLoad: 48, initialLoad: 48, status: 'NEAR_CAPACITY', specs: { cpuCores: 8, ramGb: 16, tier: 'Edge' } },
      { id: 'srv-02', name: 'SERVER-02 (Edge Node B)', region: 'us-west-1', capacity: 50, currentLoad: 42, initialLoad: 42, status: 'NEAR_CAPACITY', specs: { cpuCores: 8, ramGb: 16, tier: 'Edge' } },
    ],
    tasks: [
      { id: 'rs-01', name: 'Distributed Microservice Task', workload: 10, arrivalTime: '14:00:01', priority: 'MEDIUM' },
      { id: 'rs-02', name: 'Massive Distributed Database Dump', workload: 75, arrivalTime: '14:00:03', priority: 'CRITICAL' },
      { id: 'rs-03', name: 'Hypercube Tensor Simulation', workload: 90, arrivalTime: '14:00:06', priority: 'CRITICAL' },
      { id: 'rs-04', name: 'Quick Health Check', workload: 5, arrivalTime: '14:00:08', priority: 'LOW' },
    ],
  },
};

/**
 * In-memory database replicating Mongoose collections for servers, tasks, and assignments.
 */
class CloudDatabase {
  private servers: CloudServer[] = [];
  private tasks: CloudTask[] = [];
  private assignments: TaskAssignment[] = [];
  private currentScenario: ScenarioType = 'BALANCED_CLOUD';

  constructor() {
    this.seed();
  }

  public seed() {
    this.servers = JSON.parse(JSON.stringify(INITIAL_SERVERS)).map((s: CloudServer) => ({
      ...s,
      status: calculateServerStatus(s.currentLoad, s.capacity),
    }));
    this.tasks = JSON.parse(JSON.stringify(INITIAL_TASKS));
    this.assignments = [];
  }

  public getServers(): CloudServer[] {
    return this.servers.map(s => ({
      ...s,
      status: s.status === 'OFFLINE' ? 'OFFLINE' : calculateServerStatus(s.currentLoad, s.capacity),
    }));
  }

  public getServer(id: string): CloudServer | undefined {
    return this.servers.find(s => s.id === id);
  }

  public addServer(server: Omit<CloudServer, 'id' | 'currentLoad' | 'assignedTaskIds' | 'status' | 'initialLoad'> & { currentLoad?: number; initialLoad?: number }): CloudServer {
    const load = Number(server.currentLoad) || 0;
    const newServer: CloudServer = {
      id: `srv-${Date.now().toString(36)}`,
      name: server.name,
      region: server.region || 'us-east-1',
      capacity: Number(server.capacity) || 100,
      currentLoad: load,
      initialLoad: server.initialLoad !== undefined ? Number(server.initialLoad) : load,
      status: calculateServerStatus(load, Number(server.capacity) || 100),
      assignedTaskIds: [],
      specs: server.specs || { cpuCores: 8, ramGb: 32, tier: 'Custom' },
    };
    this.servers.push(newServer);
    return newServer;
  }

  public updateServer(id: string, updates: Partial<CloudServer>): CloudServer | null {
    const idx = this.servers.findIndex(s => s.id === id);
    if (idx === -1) return null;

    const existing = this.servers[idx];
    const updated = {
      ...existing,
      ...updates,
    };

    if (updates.capacity !== undefined || updates.currentLoad !== undefined) {
      if (updated.status !== 'OFFLINE') {
        updated.status = calculateServerStatus(updated.currentLoad, updated.capacity);
      }
    }

    this.servers[idx] = updated;
    return updated;
  }

  public getTasks(): CloudTask[] {
    return [...this.tasks];
  }

  public getTask(id: string): CloudTask | undefined {
    return this.tasks.find(t => t.id === id);
  }

  public addTask(task: { name: string; workload: number; priority?: CloudTask['priority'] }): CloudTask {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newTask: CloudTask = {
      id: `tsk-${Date.now().toString(36)}`,
      name: task.name.trim(),
      workload: Math.max(1, Math.round(Number(task.workload))),
      arrivalTime: timeStr,
      status: 'PENDING',
      priority: task.priority || 'MEDIUM',
    };
    this.tasks.push(newTask);
    return newTask;
  }

  public deleteTask(id: string): boolean {
    const initialLen = this.tasks.length;
    this.tasks = this.tasks.filter(t => t.id !== id);
    return this.tasks.length < initialLen;
  }

  public getAssignments(): TaskAssignment[] {
    return [...this.assignments];
  }

  public addAssignment(assignment: TaskAssignment) {
    this.assignments.unshift(assignment);
  }

  public loadScenario(scenarioId: ScenarioType): { servers: CloudServer[]; tasks: CloudTask[] } {
    const scenario = PREDEFINED_SCENARIOS[scenarioId];
    if (!scenario) {
      throw new Error(`Unknown scenario: ${scenarioId}`);
    }

    this.currentScenario = scenarioId;
    this.servers = scenario.servers.map(s => ({
      ...s,
      assignedTaskIds: [],
      status: calculateServerStatus(s.currentLoad, s.capacity),
    }));

    this.tasks = scenario.tasks.map(t => ({
      ...t,
      status: 'PENDING',
    }));

    this.assignments = [];
    return { servers: this.getServers(), tasks: this.getTasks() };
  }

  public reset() {
    this.seed();
  }

  public getCurrentScenario(): ScenarioType {
    return this.currentScenario;
  }

  public setBulkState(servers: CloudServer[], tasks: CloudTask[], assignments: TaskAssignment[]) {
    this.servers = servers;
    this.tasks = tasks;
    this.assignments = assignments;
  }
}

export const db = new CloudDatabase();
