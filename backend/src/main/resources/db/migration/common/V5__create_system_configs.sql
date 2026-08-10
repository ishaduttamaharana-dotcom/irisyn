CREATE TABLE system_configs (
    id BIGINT PRIMARY KEY,
    config_key VARCHAR(255) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE SEQUENCE system_configs_seq START WITH 1 INCREMENT BY 50;

