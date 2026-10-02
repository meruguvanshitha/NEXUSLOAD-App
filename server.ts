import express, { Request, Response } from 'express';
import { db, PREDEFINED_SCENARIOS } from './src/server/db';
import { runGreedyLoadBalancer, evaluateAndAssignTaskGreedy, computeMetrics } from './src/algorithms/greedyLoadBalancer';
import { ScenarioType } from './src/types';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API Routes

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'NEXUSLOAD Intelligent Cloud Task Load Balancer',
    timestamp: new Date().toISOString(),
  });
});

// 2. Servers
app.get('/api/servers', (req: Request, res: Response) => {
  try {
    const servers = db.getServers();
    res.json(servers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/servers', (req: Request, res: Response) => {
  try {
    const { name, capacity, currentLoad, region, specs } = req.body;
    if (!name || !capacity) {
      return res.status(400).json({ error: 'Name and capacity are required' });
    }
    const capNum = Number(capacity);
    const loadNum = Number(currentLoad) || 0;
    if (isNaN(capNum) || capNum <= 0) {
      return res.status(400).json({ error: 'Capacity must be a positive number' });
    }
    if (loadNum < 0 || loadNum > capNum) {
      return res.status(400).json({ error: 'Initial load cannot be negative or exceed capacity' });
    }

    const created = db.addServer({
      name,
      capacity: capNum,
      currentLoad: loadNum,
      region: region || 'us-east-1',
      specs,
    });
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/servers/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { capacity, status, currentLoad } = req.body;

    const existing = db.getServer(id);
    if (!existing) {
      return res.status(404).json({ error: 'Server not found' });
    }

    const updates: any = {};
    if (capacity !== undefined) {
      const capNum = Number(capacity);
      if (isNaN(capNum) || capNum <= 0) {
        return res.status(400).json({ error: 'Capacity must be a positive number' });
      }
      updates.capacity = capNum;
    }
    if (status !== undefined) {
      updates.status = status;
    }
    if (currentLoad !== undefined) {
      updates.currentLoad = Math.max(0, Number(currentLoad));
    }

    const updated = db.updateServer(id, updates);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Tasks
app.get('/api/tasks', (req: Request, res: Response) => {
  try {
    const tasks = db.getTasks();
    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', (req: Request, res: Response) => {
  try {
    const { name, workload, priority } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Task name is required' });
    }
    const workloadNum = Number(workload);
    if (isNaN(workloadNum) || workloadNum <= 0) {
      return res.status(400).json({ error: 'Workload must be a positive integer greater than 0' });
    }

    const created = db.addTask({
      name: name.trim(),
      workload: workloadNum,
      priority,
    });
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteTask(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Algorithm & Balancing execution (POST /api/balance)
app.post('/api/balance', (req: Request, res: Response) => {
  try {
    const { algorithm = 'GREEDY_LINEAR' } = req.body;
    const currentServers = db.getServers();
    const currentTasks = db.getTasks();

    if (currentServers.length === 0) {
      return res.status(400).json({ error: 'No servers configured in cloud cluster' });
    }

    const result = runGreedyLoadBalancer(currentServers, currentTasks, algorithm);

    // Save updated state into db
    db.setBulkState(result.servers, result.tasks, [...result.assignments, ...db.getAssignments()]);

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Step-by-step balancing execution (POST /api/balance/step)
app.post('/api/balance/step', (req: Request, res: Response) => {
  try {
    const { algorithm = 'GREEDY_LINEAR', taskId } = req.body;
    const currentServers = db.getServers();
    const currentTasks = db.getTasks();

    let targetTask = taskId ? currentTasks.find(t => t.id === taskId) : null;
    if (!targetTask) {
      targetTask = currentTasks.find(t => t.status === 'PENDING');
    }

    if (!targetTask) {
      return res.json({
        finished: true,
        message: 'No more pending tasks in queue',
        servers: currentServers,
        tasks: currentTasks,
        metrics: computeMetrics(currentServers, currentTasks, algorithm),
      });
    }

    const stepNum = currentTasks.filter(t => t.status !== 'PENDING').length + 1;
    const stepResult = evaluateAndAssignTaskGreedy(targetTask, currentServers, stepNum, algorithm);

    // Update DB
    db.updateServer(stepResult.updatedServers.find(s => s.id === stepResult.step.selectedServerId)?.id || '', {
      currentLoad: stepResult.updatedServers.find(s => s.id === stepResult.step.selectedServerId)?.currentLoad,
      assignedTaskIds: stepResult.updatedServers.find(s => s.id === stepResult.step.selectedServerId)?.assignedTaskIds,
    });

    const allTasks = currentTasks.map(t => (t.id === targetTask!.id ? stepResult.updatedTask : t));
    const allAssignments = stepResult.assignment ? [stepResult.assignment, ...db.getAssignments()] : db.getAssignments();

    db.setBulkState(stepResult.updatedServers, allTasks, allAssignments);

    res.json({
      finished: false,
      step: stepResult.step,
      task: stepResult.updatedTask,
      assignment: stepResult.assignment,
      servers: stepResult.updatedServers,
      tasks: allTasks,
      metrics: computeMetrics(stepResult.updatedServers, allTasks, algorithm),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Assignments
app.get('/api/assignments', (req: Request, res: Response) => {
  try {
    const assignments = db.getAssignments();
    res.json(assignments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Dashboard summary stats
app.get('/api/dashboard', (req: Request, res: Response) => {
  try {
    const servers = db.getServers();
    const tasks = db.getTasks();
    const assignments = db.getAssignments();
    const metrics = computeMetrics(servers, tasks);
    const scenario = db.getCurrentScenario();

    res.json({
      servers,
      tasks,
      assignments: assignments.slice(0, 20),
      metrics,
      currentScenario: scenario,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Scenarios
app.get('/api/scenarios', (req: Request, res: Response) => {
  res.json(Object.values(PREDEFINED_SCENARIOS));
});

app.post('/api/scenarios/:scenarioId', (req: Request, res: Response) => {
  try {
    const { scenarioId } = req.params;
    const loaded = db.loadScenario(scenarioId as ScenarioType);
    const metrics = computeMetrics(loaded.servers, loaded.tasks);

    res.json({
      success: true,
      scenario: PREDEFINED_SCENARIOS[scenarioId as ScenarioType],
      servers: loaded.servers,
      tasks: loaded.tasks,
      metrics,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 9. Reset
app.post('/api/reset', (req: Request, res: Response) => {
  try {
    db.reset();
    const servers = db.getServers();
    const tasks = db.getTasks();
    const metrics = computeMetrics(servers, tasks);

    res.json({
      success: true,
      message: 'Cluster state reset to baseline seed successfully',
      servers,
      tasks,
      metrics,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend in dev via Vite middlewares, or static in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Development mode with Vite middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`[NEXUSLOAD] Cloud Load Balancer Server running on port ${PORT}`);
  });
}

startServer();
