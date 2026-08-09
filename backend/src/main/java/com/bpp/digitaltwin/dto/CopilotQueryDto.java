package com.bpp.digitaltwin.dto;

public class CopilotQueryDto {
    public String question;
    public String pageContext;      // Dashboard, AssetDetail, Alerts, Infrastructure
    public String activeAssetId;    // MOTOR-001, LAPTOP-001, dc-node-03
    public String sessionId;

    public CopilotQueryDto() {}
}
