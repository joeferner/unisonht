package com.unisonht.plugin.bluray.sony;

import com.unisonht.plugin.status.PowerState;
import com.unisonht.plugin.status.Status;
import com.unisonht.plugin.status.StatusPower;

public class SonyBlurayDeviceStatus extends Status implements StatusPower {
    private final PowerState powerState;

    public SonyBlurayDeviceStatus(PowerState powerState) {
        this.powerState = powerState;
    }

    @Override
    public PowerState getPowerState() {
        return this.powerState;
    }
}
