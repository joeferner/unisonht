package com.unisonht.plugin.xbox;

import com.unisonht.plugin.status.PowerState;
import com.unisonht.plugin.status.Status;
import com.unisonht.plugin.status.StatusPower;

public class XBoxDeviceStatus extends Status implements StatusPower {
    private final PowerState powerState;

    public XBoxDeviceStatus(PowerState powerState) {
        this.powerState = powerState;
    }

    @Override
    public PowerState getPowerState() {
        return powerState;
    }
}
