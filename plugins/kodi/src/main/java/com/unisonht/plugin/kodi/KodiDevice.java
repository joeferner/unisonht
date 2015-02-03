package com.unisonht.plugin.kodi;

import com.unisonht.plugin.Device;
import com.unisonht.utils.UnisonhtLogger;
import com.unisonht.utils.UnisonhtLoggerFactory;

import static com.google.common.base.Preconditions.checkNotNull;

public class KodiDevice extends Device {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(KodiDevice.class);
    private final String address;

    public KodiDevice(String address) {
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
        LOGGER.error("TODO buttonPress(%s)", buttonName);
    }
}
