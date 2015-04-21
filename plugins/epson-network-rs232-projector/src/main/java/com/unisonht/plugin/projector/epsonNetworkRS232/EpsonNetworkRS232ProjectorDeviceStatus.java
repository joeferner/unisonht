package com.unisonht.plugin.projector.epsonNetworkRS232;

import com.unisonht.plugin.status.PowerState;
import com.unisonht.plugin.status.Status;
import com.unisonht.plugin.status.StatusInput;
import com.unisonht.plugin.status.StatusPower;

public class EpsonNetworkRS232ProjectorDeviceStatus extends Status implements StatusPower, StatusInput {
    private final PowerState powerState;
    private final StatusInput.Input input;

    public EpsonNetworkRS232ProjectorDeviceStatus(PowerState powerState, StatusInput.Input input) {
        this.powerState = powerState;
        this.input = input;
    }

    @Override
    public PowerState getPowerState() {
        return powerState;
    }

    @Override
    public StatusInput.Input getInput() {
        return this.input;
    }

    @Override
    public String toString() {
        return EpsonNetworkRS232ProjectorDeviceStatus.class.getSimpleName() + "{" +
                "powerState=" + powerState +
                ", input=" + input +
                '}';
    }
}
