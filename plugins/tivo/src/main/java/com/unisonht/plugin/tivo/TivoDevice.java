package com.unisonht.plugin.tivo;

import com.unisonht.plugin.Device;
import com.unisonht.utils.UnisonhtException;
import com.unisonht.utils.UnisonhtLogger;
import com.unisonht.utils.UnisonhtLoggerFactory;

import static com.google.common.base.Preconditions.checkNotNull;

public class TivoDevice extends Device {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(TivoDevice.class);
    private final String address;

    public TivoDevice(String address) {
        checkNotNull(address, "address is required");
        this.address = address;
    }

    @Override
    public void ensureOff() {
        throw new UnisonhtException("Not supported");
    }

    @Override
    public void ensureOn() {
        throw new UnisonhtException("Not supported");
    }

    @Override
    public void buttonPress(String buttonName) {
        LOGGER.error("TODO: buttonPress(%s)", buttonName);
    }
}
