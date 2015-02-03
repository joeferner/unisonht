package com.unisonht.plugin.receiver.yamaha;

import com.unisonht.plugin.Device;
import com.unisonht.utils.UnisonhtLogger;
import com.unisonht.utils.UnisonhtLoggerFactory;

import java.util.HashMap;
import java.util.Map;

import static com.google.common.base.Preconditions.checkNotNull;

public class YamahaReceiverDevice extends Device {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(YamahaReceiverDevice.class);
    private final String address;
    private final Map<String, String> inputMapping;

    public YamahaReceiverDevice(String address, Map<String, String> inputMapping) {
        checkNotNull(address, "address is required");
        this.address = address;
        if (inputMapping == null) {
            inputMapping = new HashMap<>();
        }
        this.inputMapping = inputMapping;
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

    @Override
    public void changeInput(String input) {
        String newInput = inputMapping.get(input);
        if (newInput != null) {
            input = newInput;
        }

        LOGGER.error("TODO changeInput(%s)", input);
    }
}
