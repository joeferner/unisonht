package com.unisonht.plugin.tivo;

import com.unisonht.plugin.status.PowerState;
import com.unisonht.plugin.status.Status;
import com.unisonht.plugin.status.StatusPower;

public class TivoDeviceStatus extends Status implements StatusPower {
    private final PowerState powerState;

    public TivoDeviceStatus(PowerState powerState) {
        this.powerState = powerState;
    }

    @Override
    public PowerState getPowerState() {
        return powerState;
    }
}
