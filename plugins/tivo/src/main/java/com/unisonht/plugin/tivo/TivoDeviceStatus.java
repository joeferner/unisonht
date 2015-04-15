package com.unisonht.plugin.tivo;

import com.unisonht.plugin.status.Status;
import com.unisonht.plugin.status.StatusConnected;

public class TivoDeviceStatus extends Status implements StatusConnected {
    private final boolean connected;

    public TivoDeviceStatus(boolean connected) {
        this.connected = connected;
    }

    @Override
    public boolean isConnected() {
        return connected;
    }
}
