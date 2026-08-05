-- Digital Twin — initial schema (H2 Fallback)
CREATE TABLE users (
    id UUID DEFAULT random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'OPERATOR', 'VIEWER')),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE servers (
    id UUID DEFAULT random_uuid() PRIMARY KEY,
    hostname VARCHAR(255) NOT NULL UNIQUE,
    rack VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('HEALTHY', 'WARNING', 'CRITICAL', 'OFFLINE')),
    cpu_usage DOUBLE PRECISION NOT NULL DEFAULT 0,
    ram_usage DOUBLE PRECISION NOT NULL DEFAULT 0,
    disk_usage DOUBLE PRECISION NOT NULL DEFAULT 0,
    temperature_c DOUBLE PRECISION NOT NULL DEFAULT 0,
    uptime_hours BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE metrics (
    id UUID DEFAULT random_uuid() PRIMARY KEY,
    server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    cpu DOUBLE PRECISION NOT NULL,
    ram DOUBLE PRECISION NOT NULL,
    disk DOUBLE PRECISION NOT NULL,
    network DOUBLE PRECISION NOT NULL
);
CREATE INDEX idx_metrics_server_id_recorded_at ON metrics (server_id, recorded_at DESC);

CREATE TABLE alerts (
    id UUID DEFAULT random_uuid() PRIMARY KEY,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
    message TEXT NOT NULL,
    source VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_alerts_created_at ON alerts (created_at DESC);

CREATE TABLE predictions (
    id UUID DEFAULT random_uuid() PRIMARY KEY,
    target_id UUID NOT NULL,
    predicted_failure_probability DOUBLE PRECISION NOT NULL,
    recommended_action TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE vms (
    id UUID DEFAULT random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    host_server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('HEALTHY', 'WARNING', 'CRITICAL', 'OFFLINE')),
    vcpu INTEGER NOT NULL,
    ram_gb INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE containers (
    id UUID DEFAULT random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image VARCHAR(500) NOT NULL,
    pod_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('RUNNING', 'PENDING', 'CRASHLOOP', 'STOPPED')),
    cpu_usage DOUBLE PRECISION NOT NULL DEFAULT 0,
    ram_usage DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE automation_logs (
    id UUID DEFAULT random_uuid() PRIMARY KEY,
    job_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    details TEXT
);
CREATE INDEX idx_automation_logs_executed_at ON automation_logs (executed_at DESC);
