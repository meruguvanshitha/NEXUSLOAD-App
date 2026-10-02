import { MongooseAuditEntry, CloudTask, CloudServer, TaskAssignment } from '../types';

/**
 * Creates dynamic simulated Mongoose operations reflecting real-world MongoDB driver execution
 */
export function generateMongooseLogsForStep(
  task: CloudTask,
  server: CloudServer | null,
  assignment: TaskAssignment | null,
  previousLoad = 0
): MongooseAuditEntry[] {
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString() + '.' + String(now.getMilliseconds()).padStart(3, '0');
  const logs: MongooseAuditEntry[] = [];

  if (server && assignment) {
    // 1. Task Model Update
    logs.push({
      id: `mng-${Date.now()}-1`,
      timestamp: now.toISOString(),
      timeFormatted,
      collectionName: 'tasks',
      method: 'findByIdAndUpdate',
      operation: `Task.findByIdAndUpdate("${task.id}", { $set: { status: "ASSIGNED", assignedServerId: "${server.id}", assignedAt: new Date() } }, { new: true })`,
      documentId: task.id,
      payload: {
        $set: {
          status: 'ASSIGNED',
          assignedServerId: server.id,
          assignedServerName: server.name,
          assignedAt: assignment.assignedAt,
        },
      },
      durationMs: Math.floor(Math.random() * 3) + 1,
      status: 'SUCCESS',
      detail: `Updated task ${task.id} (${task.name}) status -> ASSIGNED to node ${server.id}`,
    });

    // 2. Server Model Update with atomic $inc and $push
    logs.push({
      id: `mng-${Date.now()}-2`,
      timestamp: now.toISOString(),
      timeFormatted,
      collectionName: 'servers',
      method: 'findByIdAndUpdate',
      operation: `Server.findByIdAndUpdate("${server.id}", { $inc: { currentLoad: ${task.workload} }, $push: { assignedTaskIds: "${task.id}" }, $set: { status: "${server.status}" } })`,
      documentId: server.id,
      payload: {
        $inc: { currentLoad: task.workload },
        $push: { assignedTaskIds: task.id },
        $set: { status: server.status },
      },
      durationMs: Math.floor(Math.random() * 4) + 2,
      status: 'SUCCESS',
      detail: `Incremented node ${server.name} load: ${previousLoad}u -> ${server.currentLoad}u (+${task.workload}u)`,
    });

    // 3. AuditLog Document Creation
    logs.push({
      id: `mng-${Date.now()}-3`,
      timestamp: now.toISOString(),
      timeFormatted,
      collectionName: 'audit_logs',
      method: 'create',
      operation: `AuditLog.create({ taskId: "${task.id}", serverId: "${server.id}", workload: ${task.workload}, previousLoad: ${previousLoad}, newLoad: ${server.currentLoad}, action: "GREEDY_ALLOCATION" })`,
      documentId: assignment.id,
      payload: {
        taskId: task.id,
        serverId: server.id,
        workload: task.workload,
        previousLoad,
        newLoad: server.currentLoad,
        action: 'GREEDY_ALLOCATION',
      },
      durationMs: 1,
      status: 'SUCCESS',
      detail: `Recorded immutable dispatch event into audit_logs collection`,
    });
  } else {
    // Capacity exceeded: Task enters WAITING state
    logs.push({
      id: `mng-${Date.now()}-4`,
      timestamp: now.toISOString(),
      timeFormatted,
      collectionName: 'tasks',
      method: 'findByIdAndUpdate',
      operation: `Task.findByIdAndUpdate("${task.id}", { $set: { status: "WAITING", failureReason: "INSUFFICIENT_CLUSTER_CAPACITY" } }, { new: true })`,
      documentId: task.id,
      payload: {
        $set: {
          status: 'WAITING',
          failureReason: task.failureReason || 'Insufficient cluster capacity',
        },
      },
      durationMs: 2,
      status: 'WAITING_CAPACITY',
      detail: `Task ${task.id} (${task.workload}u) marked WAITING: all active servers rejected due to capacity bounds`,
    });

    logs.push({
      id: `mng-${Date.now()}-5`,
      timestamp: now.toISOString(),
      timeFormatted,
      collectionName: 'audit_logs',
      method: 'create',
      operation: `AuditLog.create({ taskId: "${task.id}", action: "REJECTED_CAPACITY_EXCEEDED", status: "WAITING", workload: ${task.workload} })`,
      documentId: `log-${Date.now()}`,
      payload: {
        taskId: task.id,
        workload: task.workload,
        action: 'REJECTED_CAPACITY_EXCEEDED',
        status: 'WAITING',
      },
      durationMs: 1,
      status: 'REJECTED',
      detail: `Logged capacity overflow rejection for task ${task.id}`,
    });
  }

  return logs;
}
