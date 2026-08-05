package com.bpp.digitaltwin.service;

import com.bpp.digitaltwin.dto.ChatRequestDto;
import com.bpp.digitaltwin.dto.ChatResponseDto;
import com.bpp.digitaltwin.entity.*;
import com.bpp.digitaltwin.repository.*;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class ChatService {

    @Inject
    ServerRepository serverRepository;

    @Inject
    VmRepository vmRepository;

    @Inject
    ContainerRepository containerRepository;

    @Inject
    AlertRepository alertRepository;

    public ChatResponseDto reply(ChatRequestDto request) {
        String sessionId = request.sessionId() != null ? request.sessionId() : UUID.randomUUID().toString();
        String message = request.message().trim().toLowerCase();

        String reply;

        if (message.contains("unhealthy") || message.contains("node-0") || message.contains("node-")) {
            reply = handleUnhealthyNodesQuery(message);
        } else if (message.contains("vm") || message.contains("virtual machine") || message.contains("vms")) {
            reply = handleVmQuery(message);
        } else if (message.contains("alert") || message.contains("incident")) {
            reply = handleAlertsQuery();
        } else if (message.contains("playbook") || message.contains("ansible")) {
            reply = handleAnsiblePlaybookQuery();
        } else if (message.contains("command") || message.contains("kubectl") || message.contains("oc ")) {
            reply = handleKubernetesCommandQuery();
        } else if (message.contains("summary") || message.contains("health") || message.contains("cluster")) {
            reply = handleClusterSummaryQuery();
        } else {
            reply = handleDefaultConversation();
        }

        return new ChatResponseDto(sessionId, reply);
    }

    private String handleUnhealthyNodesQuery(String msg) {
        List<ServerEntity> unhealthy = serverRepository.list("status != ?1", ServerStatus.HEALTHY);
        if (unhealthy.isEmpty()) {
            return "All physical server nodes in Racks A, B, and C are currently **HEALTHY**. Telemetry averages are within safe operating bounds.";
        }

        StringBuilder sb = new StringBuilder("### Unhealthy Server Telemetry Diagnosis:\n\n");
        for (ServerEntity s : unhealthy) {
            sb.append("- **").append(s.hostname).append("** (").append(s.rack).append("): Status is **").append(s.status).append("**\n")
              .append("  - Telemetry: CPU: ").append(s.cpuUsage).append("%, RAM: ").append(s.ramUsage).append("%, Temp: ").append(s.temperatureC).append("°C\n")
              .append("  - Diagnostic: ");
            if (s.cpuUsage > 90) {
                sb.append("CPU overload detected. Workloads are exceeding capacity limit.\n")
                  .append("  - Recommended Playbook: `scale-deployment.yml` to spin up additional pods.\n");
            } else if (s.ramUsage > 90) {
                sb.append("Severe memory allocation drift (possible leak) identified in virtual workloads.\n")
                  .append("  - Recommended Playbook: `restart-vm.yml` to recycle the guest VM.\n");
            } else if (s.temperatureC > 80) {
                sb.append("Ambient node temperature has exceeded critical boundary (thermal hazard).\n")
                  .append("  - Recommended Action: Migrate running virtual guest machines immediately via OpenShift Virtualization.\n");
            } else {
                sb.append("General infrastructure warning raised. Inspect local hypervisor logs.\n");
            }
            sb.append("\n");
        }
        return sb.toString();
    }

    private String handleVmQuery(String msg) {
        List<VmEntity> badVms = vmRepository.list("status != ?1", ServerStatus.HEALTHY);
        if (badVms.isEmpty()) {
            return "All virtual guest workloads are currently **HEALTHY** and running. Hypervisors are reporting zero guest alerts.";
        }

        StringBuilder sb = new StringBuilder("### Unhealthy Guest Virtual Machines (OpenShift Virtualization):\n\n");
        for (VmEntity v : badVms) {
            ServerEntity host = serverRepository.findById(v.hostServerId);
            String hostName = host != null ? host.hostname : "unknown host";
            sb.append("- **").append(v.name).append("** on host `").append(hostName).append("`: Status is **").append(v.status).append("**\n")
              .append("  - Specifications: ").append(v.vcpu).append(" vCPUs | ").append(v.ramGb).append(" GB RAM\n")
              .append("  - Recovery: Trigger `restart-vm.yml` playbook or execute live migration to clear warning status.\n\n");
        }
        return sb.toString();
    }

    private String handleAlertsQuery() {
        List<AlertEntity> active = alertRepository.list("acknowledged = false order by createdAt desc");
        if (active.isEmpty()) {
            return "No active, unacknowledged alerts found in the incident console. All parameters are within threshold limits.";
        }

        StringBuilder sb = new StringBuilder("### Active Incident Center Alerts:\n\n");
        for (AlertEntity a : active.stream().limit(5).collect(Collectors.toList())) {
            sb.append("- [").append(a.severity).append("] **").append(a.message).append("** (Source: `").append(a.source).append("`)\n");
        }
        sb.append("\nUse the **Incident Panel** to acknowledge these alerts or instruct me to run mitigation playbooks.");
        return sb.toString();
    }

    private String handleAnsiblePlaybookQuery() {
        return "### Generated Ansible Self-Healing Playbook:\n" +
               "```yaml\n" +
               "- name: Remediate High CPU Load & Anomaly\n" +
               "  hosts: hypervisors\n" +
               "  vars:\n" +
               "    target_node: \"dc-node-04\"\n" +
               "  tasks:\n" +
               "    - name: Validate node performance stats\n" +
               "      ansible.builtin.setup:\n" +
               "        filter: ansible_processor_vcpus\n" +
               "\n" +
               "    - name: Migrate active pods to other nodes in the namespace\n" +
               "      kubernetes.core.k8s_drain:\n" +
               "        node: \"{{ target_node }}\"\n" +
               "        state: drain\n" +
               "\n" +
               "    - name: Trigger Ansible AAP cluster notification\n" +
               "      ansible.builtin.debug:\n" +
               "        msg: \"Drain operation completed. Initiating container checks.\"\n" +
               "```\n" +
               "You can trigger this run directly from the **Automation Panel** by selecting the appropriate remediation playbook.";
    }

    private String handleKubernetesCommandQuery() {
        return "### Red Hat OpenShift & Kubernetes Remediation Commands:\n\n" +
               "1. **Check all running pods in the active namespace**:\n" +
               "   ```bash\n" +
               "   oc get pods -n digital-twin\n" +
               "   ```\n" +
               "2. **View cluster node resource allocation**:\n" +
               "   ```bash\n" +
               "   oc adm top nodes\n" +
               "   ```\n" +
               "3. **Rollout restart the frontend service to clear memory**:\n" +
               "   ```bash\n" +
               "   oc rollout restart deployment/web-portal -n digital-twin\n" +
               "   ```\n" +
               "4. **Get detailed logs for the crashlooping container**:\n" +
               "   ```bash\n" +
               "   kubectl logs -f deployment/reporting-agent -n digital-twin\n" +
               "   ```";
    }

    private String handleClusterSummaryQuery() {
        long total = serverRepository.count();
        long bad = serverRepository.count("status != ?1", ServerStatus.HEALTHY);
        long vmsCount = vmRepository.count();
        long podsCount = containerRepository.count();

        return "### OpenShift Cluster Telemetry Summary:\n\n" +
               "- **Total Infrastructure Nodes**: " + total + " (" + (total - bad) + " Healthy, " + bad + " Alerting)\n" +
               "- **Orchestrated guest workloads**: " + vmsCount + " Virtual Machines (OpenShift Virtualization), " + podsCount + " Container Pods\n" +
               "- **System Observability status**: Prometheus scraping active. All logs and custom metrics are currently streaming to Grafana.\n" +
               "- **AI/ML Forecasting**: OpenShift AI anomaly model is active, checking metrics deviations every 2 seconds.";
    }

    private String handleDefaultConversation() {
        return "Hello! I am **OpenClaw**, your virtual Red Hat SRE Assistant.\n\n" +
               "I monitor this Data Center Digital Twin in real time and can execute playbooks on **Ansible Automation Platform** or commands on **Red Hat OpenShift**.\n\n" +
               "**Try asking me things like**:\n" +
               "- *Is the cluster healthy?*\n" +
               "- *Why is dc-node-03 unhealthy?*\n" +
               "- *Show active alerts.*\n" +
               "- *Recommend recovery playbooks.*\n" +
               "- *Generate Ansible playbook.*";
    }
}
