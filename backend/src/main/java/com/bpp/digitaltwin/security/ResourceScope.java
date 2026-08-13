package com.bpp.digitaltwin.security;

import java.util.Objects;

/**
 * Resource Scope Model implementing hierarchical access scoping:
 * Organization -> Site -> Plant -> Area -> Asset -> Sensor -> Metric.
 */
public class ResourceScope {

    public final String organization;
    public final String site;
    public final String plant;
    public final String area;
    public final String asset;
    public final String sensor;

    public ResourceScope(String organization, String site, String plant, String area, String asset, String sensor) {
        this.organization = organization != null ? organization : "GLOBAL_ORG";
        this.site = site != null ? site : "MAIN_SITE";
        this.plant = plant != null ? plant : "PLANT_01";
        this.area = area != null ? area : "AREA_A";
        this.asset = asset;
        this.sensor = sensor;
    }

    public boolean isAuthorized(ResourceScope targetScope) {
        if (targetScope == null) return true;
        if (!Objects.equals(this.organization, targetScope.organization)) return false;
        if (this.site != null && !this.site.equalsIgnoreCase(targetScope.site)) return false;
        if (this.plant != null && !this.plant.equalsIgnoreCase(targetScope.plant)) return false;
        if (this.area != null && !this.area.equalsIgnoreCase(targetScope.area)) return false;
        if (this.asset != null && targetScope.asset != null && !this.asset.equalsIgnoreCase(targetScope.asset)) return false;
        return true;
    }

    public static ResourceScope defaultScopeForAsset(String assetId) {
        return new ResourceScope("IRISYN_ENTERPRISE", "SITE_EAST", "PLANT_A", "AREA_SERVERS", assetId, "ALL_SENSORS");
    }
}
