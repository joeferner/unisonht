package com.unisonht.plugin;

import com.unisonht.plugin.status.Status;
import com.unisonht.utils.UnisonhtException;

public abstract class Device {
    public abstract void ensureOff();

    public abstract void ensureOn();

    public abstract void buttonPress(String buttonName);

    public void changeInput(String input) {
        throw new UnisonhtException("Changing input for this device Not support");
    }

    public abstract Status getStatus();
}
