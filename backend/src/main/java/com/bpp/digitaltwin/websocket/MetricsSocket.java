package com.bpp.digitaltwin.websocket;

import io.quarkus.websockets.next.OnOpen;
import io.quarkus.websockets.next.OnTextMessage;
import io.quarkus.websockets.next.WebSocket;

/**
 * Real-time metrics stream placeholder. In Phase 2 this simply echoes
 * connection events; the monitoring phase will push live metric/alert
 * updates here instead of the frontend polling REST endpoints.
 */
@WebSocket(path = "/ws/metrics")
public class MetricsSocket {

    @OnOpen
    public String onOpen() {
        return "{\"event\":\"connected\",\"channel\":\"metrics\"}";
    }

    @OnTextMessage
    public String onMessage(String message) {
        return "{\"event\":\"echo\",\"payload\":" + message + "}";
    }
}
