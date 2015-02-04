package com.unisonht.plugin.bluray.sony;

import com.unisonht.plugin.Device;
import com.unisonht.utils.UnisonhtException;
import com.unisonht.utils.UnisonhtLogger;
import com.unisonht.utils.UnisonhtLoggerFactory;

import static com.google.common.base.Preconditions.checkNotNull;

public class SonyBlurayDevice extends Device {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(SonyBlurayDevice.class);
    private final String address;

    public SonyBlurayDevice(String address) {
        checkNotNull(address, "address is required");
        this.address = address;
    }

    @Override
    public void ensureOff() {
        LOGGER.error("TODO ensureOff");
    }

    @Override
    public void ensureOn() {
        LOGGER.error("TODO ensureOn");
    }

    @Override
    public void buttonPress(String buttonName) {
        LOGGER.error("TODO: buttonPress(%s)", buttonName);
    }
}
