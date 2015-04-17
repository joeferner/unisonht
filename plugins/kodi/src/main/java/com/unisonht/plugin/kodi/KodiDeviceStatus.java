package com.unisonht.plugin.kodi;

import com.unisonht.plugin.status.PowerState;
import com.unisonht.plugin.status.Status;
import com.unisonht.plugin.status.StatusPower;

public class KodiDeviceStatus extends Status implements StatusPower {
    private final PowerState powerState;

    public KodiDeviceStatus(PowerState powerState) {
        this.powerState = powerState;
    }

    @Override
    public PowerState getPowerState() {
        return powerState;
    }
}
