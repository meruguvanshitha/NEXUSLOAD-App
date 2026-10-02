import { CloudServer, CloudTask, TaskAssignment, BalanceResult, AlgorithmicMetrics, ScenarioType, ScenarioDefinition, DecisionStep } from '../types';

export const API_BASE = '/api';

export async function fetchHealth(): Promise<{ status: string; system: string; timestamp: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Failed to fetch health');
  return res.json();
}

export async function fetchDashboard(): Promise<{
  servers: CloudServer[];
  tasks: CloudTask[];
  assignments: TaskAssignment[];
  metrics: AlgorithmicMetrics;
  currentScenario: ScenarioType;
  timestamp: string;
}> {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch dashboard data');
  return res.json();
}

export async function fetchServers(): Promise<CloudServer[]> {
  const res = await fetch(`${API_BASE}/servers`);
  if (!res.ok) throw new Error('Failed to fetch servers');
  return res.json();
}

export async function createServer(serverData: Partial<CloudServer>): Promise<CloudServer> {
  const res = await fetch(`${API_BASE}/servers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(serverData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to create server' }));
    throw new Error(err.error || 'Failed to create server');
  }
  return res.json();
}

export async function updateServer(id: string, updates: Partial<CloudServer>): Promise<CloudServer> {
  const res = await fetch(`${API_BASE}/servers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to update server' }));
    throw new Error(err.error || 'Failed to update server');
  }
  return res.json();
}

export async function fetchTasks(): Promise<CloudTask[]> {
  const res = await fetch(`${API_BASE}/tasks`);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function createTask(taskData: { name: string; workload: number; priority?: CloudTask['priority'] }): Promise<CloudTask> {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to create task' }));
    throw new Error(err.error || 'Failed to create task');
  }
  return res.json();
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete task');
}

export async function executeBalance(algorithm: 'GREEDY_LINEAR' | 'GREEDY_HEAP' = 'GREEDY_LINEAR'): Promise<BalanceResult> {
  const res = await fetch(`${API_BASE}/balance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ algorithm }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to execute balancing algorithm' }));
    throw new Error(err.error || 'Failed to execute balancing algorithm');
  }
  return res.json();
}

export async function executeBalanceStep(
  algorithm: 'GREEDY_LINEAR' | 'GREEDY_HEAP' = 'GREEDY_LINEAR',
  taskId?: string
): Promise<{
  finished: boolean;
  step?: DecisionStep;
  task?: CloudTask;
  assignment?: TaskAssignment | null;
  servers: CloudServer[];
  tasks: CloudTask[];
  metrics: AlgorithmicMetrics;
  message?: string;
}> {
  const res = await fetch(`${API_BASE}/balance/step`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ algorithm, taskId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to execute step' }));
    throw new Error(err.error || 'Failed to execute step');
  }
  return res.json();
}

export async function fetchAssignments(): Promise<TaskAssignment[]> {
  const res = await fetch(`${API_BASE}/assignments`);
  if (!res.ok) throw new Error('Failed to fetch assignments');
  return res.json();
}

export async function fetchScenarios(): Promise<ScenarioDefinition[]> {
  const res = await fetch(`${API_BASE}/scenarios`);
  if (!res.ok) throw new Error('Failed to fetch scenarios');
  return res.json();
}

export async function loadScenario(scenarioId: ScenarioType): Promise<{
  success: boolean;
  scenario: ScenarioDefinition;
  servers: CloudServer[];
  tasks: CloudTask[];
  metrics: AlgorithmicMetrics;
}> {
  const res = await fetch(`${API_BASE}/scenarios/${scenarioId}`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to load scenario' }));
    throw new Error(err.error || 'Failed to load scenario');
  }
  return res.json();
}

export async function resetCluster(): Promise<{
  success: boolean;
  message: string;
  servers: CloudServer[];
  tasks: CloudTask[];
  metrics: AlgorithmicMetrics;
}> {
  const res = await fetch(`${API_BASE}/reset`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to reset cluster');
  return res.json();
}
