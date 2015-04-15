package com.unisonht.plugin.wii;

import com.unisonht.plugin.Device;
import com.unisonht.plugin.status.Status;
import com.unisonht.plugin.status.StatusUnknown;

public class WiiDevice extends Device {
    @Override
    public void ensureOff() {

    }

    @Override
    public void ensureOn() {

    }

    @Override
    public void buttonPress(String buttonName) {

    }

    @Override
    public Status getStatus() {
        return new StatusUnknown();
    }
}
