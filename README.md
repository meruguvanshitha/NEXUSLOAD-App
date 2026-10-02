# NEXUSLOAD – Intelligent Cloud Task Load Balancer

## 1. Problem Statement
Distribute computing tasks among available heterogeneous servers to minimize waiting time and prevent individual servers from becoming overloaded.

## 2. Algorithmic Approach (Greedy Strategy)
NEXUSLOAD employs a Greedy Load Balancing algorithm. For each incoming task T, the system:
1. Scans active online servers S.
2. Filters out nodes exceeding capacity (Load + Workload > Capacity).
3. Assigns T to the node with the lowest current load.

## 3. Pseudocode
```text
FUNCTION scheduleTask(Task T, List Servers S):
    eligibleServers = []
    FOR EACH server IN S:
        IF (server.currentLoad + T.workload) <= server.maxCapacity:
            APPEND server TO eligibleServers
    
    IF eligibleServers IS EMPTY:
        RETURN REJECT_OR_QUEUE(T)
    
    targetServer = FIND_MIN_LOAD(eligibleServers)
    targetServer.currentLoad += T.workload
    RETURN ASSIGNED
