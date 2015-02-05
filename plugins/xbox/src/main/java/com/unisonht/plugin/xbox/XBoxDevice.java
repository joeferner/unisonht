package com.unisonht.plugin.xbox;

import com.unisonht.plugin.Device;
import com.unisonht.utils.UnisonhtException;

public class XBoxDevice extends Device {
    @Override
    public void ensureOff() {
        throw new UnisonhtException("TODO: not supported");
    }

    @Override
    public void ensureOn() {
        throw new UnisonhtException("TODO: not supported");
    }

    @Override
    public void buttonPress(String buttonName) {
        throw new UnisonhtException("TODO: not supported");
    }
}
