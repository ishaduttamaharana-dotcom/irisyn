package com.bpp.digitaltwin.dto;

import com.bpp.digitaltwin.entity.VmEntity;
import java.util.UUID;

public record VmDto(UUID id, String name, UUID hostServerId, String status, int vcpu, int ramGb) {
    public static VmDto from(VmEntity e) {
        return new VmDto(e.id, e.name, e.hostServerId, e.status.name(), e.vcpu, e.ramGb);
    }
}
