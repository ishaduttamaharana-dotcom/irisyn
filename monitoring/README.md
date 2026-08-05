# monitoring/

Placeholder Prometheus + Grafana configuration for Phase 2. No real metrics
collection pipeline is wired up yet — the backend only exposes its default
Quarkus/JVM metrics at `/metrics` via `quarkus-micrometer-registry-prometheus`.

```
monitoring/
  prometheus/
    prometheus.yml            # Scrape config (backend + self)
  grafana/
    provisioning/
      datasources/             # Auto-provisions the Prometheus datasource
      dashboards/               # Auto-provisions dashboards from ./dashboards
    dashboards/
      cluster-overview.json    # Empty placeholder dashboard
```

## Local run (optional, for later phases)
```bash
podman run -d --name prometheus -p 9090:9090 \
  -v $(pwd)/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:Z \
  prom/prometheus

podman run -d --name grafana -p 3000:3000 \
  -v $(pwd)/grafana/provisioning:/etc/grafana/provisioning:Z \
  -v $(pwd)/grafana/dashboards:/var/lib/grafana/dashboards:Z \
  grafana/grafana
```
