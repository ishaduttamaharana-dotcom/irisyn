package com.bpp.digitaltwin.websocket;

import io.quarkus.websockets.next.OnOpen;
import io.quarkus.websockets.next.OnTextMessage;
import io.quarkus.websockets.next.WebSocket;

@WebSocket(path = "/ws/telemetry")
public class TelemetrySocket {

    @OnOpen
    public String onOpen() {
        return "{\"event\":\"connected\",\"channel\":\"telemetry\"}";
    }

    @OnTextMessage
    public String onMessage(String message) {
        return "{\"event\":\"echo\",\"payload\":" + message + "}";
    }
}
