-- Lightweight dev/demo seed data — safe to remove for production deploys.
INSERT INTO servers (hostname, rack, status, cpu_usage, ram_usage, disk_usage, temperature_c, uptime_hours) VALUES
    ('dc-node-01', 'Rack A', 'HEALTHY', 42, 55, 38, 41, 1200),
    ('dc-node-02', 'Rack A', 'HEALTHY', 61, 48, 52, 44, 980),
    ('dc-node-03', 'Rack B', 'WARNING', 88, 76, 61, 58, 300),
    ('dc-node-04', 'Rack B', 'CRITICAL', 96, 91, 70, 67, 45);

INSERT INTO alerts (severity, message, source, acknowledged) VALUES
    ('CRITICAL', 'Node dc-node-04 CPU sustained above 95%', 'dc-node-04', FALSE),
    ('WARNING', 'Rack B ambient temperature rising', 'Rack B', FALSE),
    ('INFO', 'Automation job nightly-backup completed', 'automation', TRUE);
