package com.bpp.digitaltwin.websocket;

import io.quarkus.websockets.next.OnOpen;
import io.quarkus.websockets.next.OnTextMessage;
import io.quarkus.websockets.next.WebSocket;

@WebSocket(path = "/ws/twins")
public class TwinSocket {

    @OnOpen
    public String onOpen() {
        return "{\"eventType\":\"TWIN_STREAM_CONNECTED\",\"channel\":\"twins\",\"timestamp\":\"" + java.time.Instant.now().toString() + "\"}";
    }

    @OnTextMessage
    public String onMessage(String message) {
        return "{\"eventType\":\"TWIN_ECHO\",\"payload\":" + message + "}";
    }
}
