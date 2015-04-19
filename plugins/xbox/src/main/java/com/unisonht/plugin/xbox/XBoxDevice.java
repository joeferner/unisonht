package com.unisonht.plugin.xbox;

import com.unisonht.plugin.Device;
import com.unisonht.plugin.status.PowerState;
import com.unisonht.plugin.status.Status;
import com.unisonht.utils.UnisonhtException;
import com.unisonht.utils.UnisonhtLogger;
import com.unisonht.utils.UnisonhtLoggerFactory;

import java.net.InetSocketAddress;
import java.net.Socket;

public class XBoxDevice extends Device {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(XBoxDevice.class);
    public static final int LISTENING_PORT = 1025;
    private final String address;

    public XBoxDevice(String address) {
        this.address = address;
    }

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

    @Override
    public Status getStatus() {
        PowerState powerState = PowerState.OFF;

        try {
            InetSocketAddress addr = new InetSocketAddress(address, LISTENING_PORT);
            try (Socket socket = new Socket()) {
                socket.connect(addr, 3000);
                if (socket.isConnected()) {
                    powerState = PowerState.ON;
                }
            }
        } catch (Exception e) {
            LOGGER.warn("Could not connect to xbox %s at %d", this.address, LISTENING_PORT);
        }

        return new XBoxDeviceStatus(powerState);
    }
}
