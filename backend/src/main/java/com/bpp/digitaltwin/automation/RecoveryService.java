package com.bpp.digitaltwin.automation;

import com.bpp.digitaltwin.dto.RecoveryRequestDto;
import com.bpp.digitaltwin.dto.RecoveryResponseDto;
import com.bpp.digitaltwin.entity.AutomationLogEntity;
import com.bpp.digitaltwin.repository.AutomationLogRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.Instant;
import java.util.UUID;

@ApplicationScoped
public class RecoveryService {

    @Inject
    AutomationLogRepository logRepository;

    @Inject
    io.micrometer.core.instrument.MeterRegistry registry;

    @Transactional
    public RecoveryResponseDto triggerRecovery(RecoveryRequestDto request) {
        String actionName = request.action().name();
        String target = request.targetId().toString();

        String playbookName = switch (request.action()) {
            case RESTART -> "restart-vm.yml";
            case MIGRATE -> "restart-pod.yml"; // pod or VM migration
            case SCALE -> "scale-deployment.yml";
            case ISOLATE -> "cleanup-logs.yml";
        };

        // Generate Ansible AAP terminal output simulation
        String stdout = generateAnsibleStdout(playbookName, actionName, target);

        // Record execution in database
        AutomationLogEntity log = new AutomationLogEntity();
        log.jobName = "AAP Playbook: " + playbookName;
        log.status = "SUCCESS";
        log.executedAt = Instant.now();
        log.details = stdout;
        logRepository.persist(log);

        // Increment Micrometer counter for Prometheus
        registry.counter("playbook_execution_total", "playbook", playbookName, "status", "SUCCESS").increment();

        return new RecoveryResponseDto(request.targetId(), "SUCCESS", stdout);
    }

    private String generateAnsibleStdout(String playbookName, String action, String target) {
        return """
            [AAP Console] Running playbook %s...
            
            PLAY [Remediate Target Resource: %s] *******************************************
            
            TASK [Gathering Facts] *********************************************************
            ok: [localhost]
            
            TASK [Check Target Connectivity: %s] ******************************************
            ok: [localhost] => {
                "changed": false,
                "ping": "pong"
            }
            
            TASK [Run Action: %s] **********************************************************
            changed: [localhost] => {
                "changed": true,
                "msg": "Ansible task completed successfully on target hypervisor/pod cluster",
                "ansible_facts": {
                    "execution_time_seconds": 3.42,
                    "target_uid": "%s"
                }
            }
            
            PLAY RECAP *********************************************************************
            localhost                  : ok=3    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
            
            [AAP Console] Playbook finished with status SUCCESS in 3.42s
            """.formatted(playbookName, action, target, action, target);
    }
}
