package com.unisonht.plugin;

import com.unisonht.utils.UnisonhtLogger;
import com.unisonht.utils.UnisonhtLoggerFactory;

import java.util.ArrayList;
import java.util.List;

public abstract class Input {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(Input.class);
    private List<InputEventListener> eventListeners = new ArrayList<>();

    public void addEventListener(InputEventListener inputEventListener) {
        this.eventListeners.add(inputEventListener);
    }

    public void removeEventListener(InputEventListener inputEventListener) {
        this.eventListeners.remove(inputEventListener);
    }

    protected void fireEvent(String remoteControlName, String buttonName, int repeatCount) {
        LOGGER.debug("fireEvent(remoteControlName:%s, buttonName:%s, repeatCount:%d)", remoteControlName, buttonName, repeatCount);
        for (InputEventListener inputEventListener : this.eventListeners) {
            try {
                inputEventListener.onButtonPress(remoteControlName, buttonName, repeatCount);
            } catch (Exception ex) {
                LOGGER.error("Failed to send button press %s, %s, %d", remoteControlName, buttonName, repeatCount, ex);
            }
        }
    }
}
