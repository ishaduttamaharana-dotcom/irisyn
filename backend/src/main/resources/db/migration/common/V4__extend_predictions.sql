-- Extend predictions table for OpenShift AI metrics
ALTER TABLE predictions ADD COLUMN health_score DOUBLE PRECISION NOT NULL DEFAULT 100;
ALTER TABLE predictions ADD COLUMN failure_type VARCHAR(255) NOT NULL DEFAULT 'NONE';
ALTER TABLE predictions ADD COLUMN confidence_score DOUBLE PRECISION NOT NULL DEFAULT 1.0;
