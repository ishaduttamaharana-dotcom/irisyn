-- Seed Phase 3 Data

-- 1. Seed Users
INSERT INTO users (email, display_name, role, password_hash) VALUES
    ('admin@example.com', 'Admin User', 'ADMIN', '$2a$10$eA32bO59H1Vf5g.0K35z4.g2y0hJd4ZgCjM/mH4bLqH7FpB9m8l4.'), -- placeholder bcrypt-like string
    ('operator@example.com', 'Operator User', 'OPERATOR', '$2a$10$eA32bO59H1Vf5g.0K35z4.g2y0hJd4ZgCjM/mH4bLqH7FpB9m8l4.'),
    ('viewer@example.com', 'Viewer User', 'VIEWER', '$2a$10$eA32bO59H1Vf5g.0K35z4.g2y0hJd4ZgCjM/mH4bLqH7FpB9m8l4.');

-- 2. Seed Rack C Servers
INSERT INTO servers (hostname, rack, status, cpu_usage, ram_usage, disk_usage, temperature_c, uptime_hours) VALUES
    ('dc-node-05', 'Rack C', 'HEALTHY', 35.5, 45.0, 22.8, 38.2, 2100),
    ('dc-node-06', 'Rack C', 'HEALTHY', 52.0, 48.5, 30.2, 39.5, 1450);

-- 3. Seed Virtual Machines
INSERT INTO vms (name, host_server_id, status, vcpu, ram_gb) VALUES
    ('vm-k8s-master-01', (SELECT id FROM servers WHERE hostname = 'dc-node-01'), 'HEALTHY', 4, 16),
    ('vm-k8s-worker-01', (SELECT id FROM servers WHERE hostname = 'dc-node-01'), 'HEALTHY', 8, 32),
    ('vm-k8s-worker-02', (SELECT id FROM servers WHERE hostname = 'dc-node-02'), 'HEALTHY', 8, 32),
    ('vm-db-postgresql', (SELECT id FROM servers WHERE hostname = 'dc-node-02'), 'HEALTHY', 4, 16),
    ('vm-legacy-app', (SELECT id FROM servers WHERE hostname = 'dc-node-03'), 'WARNING', 2, 8),
    ('vm-workload-temp', (SELECT id FROM servers WHERE hostname = 'dc-node-04'), 'CRITICAL', 8, 16),
    ('vm-monitoring-01', (SELECT id FROM servers WHERE hostname = 'dc-node-05'), 'HEALTHY', 4, 16),
    ('vm-logging-01', (SELECT id FROM servers WHERE hostname = 'dc-node-06'), 'HEALTHY', 4, 16);

-- 4. Seed Containers
INSERT INTO containers (name, image, pod_name, status, cpu_usage, ram_usage) VALUES
    ('nginx-frontend', 'docker.io/library/nginx:alpine', 'web-portal-58fcf9b6c-abcd1', 'RUNNING', 1.2, 45.5),
    ('auth-service', 'registry.internal/dt-auth:v1.2.0', 'auth-deployment-f48ab-xyz89', 'RUNNING', 5.8, 128.0),
    ('gateway-api', 'registry.internal/dt-gateway:v1.2.0', 'gateway-api-7b89fd6-lm123', 'RUNNING', 8.5, 96.0),
    ('cache-redis', 'docker.io/library/redis:7-alpine', 'redis-cache-0', 'RUNNING', 0.5, 64.0),
    ('data-crawler', 'registry.internal/dt-crawler:v0.9.0', 'crawler-job-pq456', 'PENDING', 0.0, 0.0),
    ('reporting-agent', 'registry.internal/dt-report:v1.0.0', 'report-gen-5cd89-op789', 'CRASHLOOP', 15.0, 512.0);

-- 5. Seed Predictions
INSERT INTO predictions (target_id, predicted_failure_probability, recommended_action) VALUES
    ((SELECT id FROM servers WHERE hostname = 'dc-node-03'), 0.72, 'Slight memory leak detected. Schedule node drain and reboot during maintenance window.'),
    ((SELECT id FROM servers WHERE hostname = 'dc-node-04'), 0.96, 'High processor temperature. Migrate all running workloads to Rack C immediately.');

-- 6. Seed Automation Logs
INSERT INTO automation_logs (job_name, status, details) VALUES
    ('node-drain-dc-node-04', 'IN_PROGRESS', 'Initiating workload migration for critical node dc-node-04. Live migrating VM vm-workload-temp.'),
    ('temp-mitigation-rack-b', 'COMPLETED', 'Triggered external HVAC cooling boost for Rack B. Ambient temperature returned to safe range.'),
    ('database-backup-nightly', 'COMPLETED', 'PostgreSQL database snapshot uploaded to S3 bucket. Compression ratio 4.2x.');

-- 7. Seed Historical Metrics
-- dc-node-01 history
INSERT INTO metrics (server_id, recorded_at, cpu, ram, disk, network) VALUES
    ((SELECT id FROM servers WHERE hostname = 'dc-node-01'), now() - INTERVAL '10' MINUTE, 35.0, 52.0, 38.0, 45.2),
    ((SELECT id FROM servers WHERE hostname = 'dc-node-01'), now() - INTERVAL '8' MINUTE, 38.0, 52.5, 38.0, 48.0),
    ((SELECT id FROM servers WHERE hostname = 'dc-node-01'), now() - INTERVAL '6' MINUTE, 42.0, 53.0, 38.0, 51.5),
    ((SELECT id FROM servers WHERE hostname = 'dc-node-01'), now() - INTERVAL '4' MINUTE, 40.0, 54.0, 38.0, 50.0),
    ((SELECT id FROM servers WHERE hostname = 'dc-node-01'), now() - INTERVAL '2' MINUTE, 41.0, 55.0, 38.0, 55.0),
    ((SELECT id FROM servers WHERE hostname = 'dc-node-01'), now(), 42.0, 55.0, 38.0, 58.0);

-- dc-node-02 history
INSERT INTO metrics (server_id, recorded_at, cpu, ram, disk, network) VALUES
    ((SELECT id FROM servers WHERE hostname = 'dc-node-02'), now() - INTERVAL '10' MINUTE, 55.0, 46.0, 52.0, 85.0),
    ((SELECT id FROM servers WHERE hostname = 'dc-node-02'), now() - INTERVAL '8' MINUTE, 57.0, 47.0, 52.0, 88.2),
    ((SELECT id FROM servers WHERE hostname = 'dc-node-02'), now() - INTERVAL '6' MINUTE, 58.0, 47.5, 52.0, 92.0),
    ((SELECT id FROM servers WHERE hostname = 'dc-node-02'), now() - INTERVAL '4' MINUTE, 60.0, 48.0, 52.0, 90.5),
    ((SELECT id FROM servers WHERE hostname = 'dc-node-02'), now() - INTERVAL '2' MINUTE, 62.0, 48.0, 52.0, 95.0),
    ((SELECT id FROM servers WHERE hostname = 'dc-node-02'), now(), 61.0, 48.0, 52.0, 94.2);
