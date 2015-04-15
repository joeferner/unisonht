package com.unisonht.plugin.receiver.yamaha;

import com.unisonht.plugin.status.*;

public class YamahaReceiverDeviceStatus extends Status implements StatusPower, StatusInput, StatusVolume {
    private final PowerState powerState;
    private final Double volume;
    private final StatusInput.Input input;

    public YamahaReceiverDeviceStatus(PowerState powerState, Double volume, StatusInput.Input input) {
        this.powerState = powerState;
        this.volume = volume;
        this.input = input;
    }

    @Override
    public PowerState getPowerState() {
        return powerState;
    }

    @Override
    public Input getInput() {
        return this.input;
    }

    @Override
    public Double getVolume() {
        return this.volume;
    }
}
