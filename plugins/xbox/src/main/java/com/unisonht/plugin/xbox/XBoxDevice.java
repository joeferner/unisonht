package com.unisonht.plugin.xbox;

import com.unisonht.plugin.Device;
import com.unisonht.plugin.status.PowerState;
import com.unisonht.plugin.status.Status;
import com.unisonht.utils.UnisonhtException;
import com.unisonht.utils.UnisonhtLogger;
import com.unisonht.utils.UnisonhtLoggerFactory;

import java.io.IOException;
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
            Socket sock = new Socket();
            sock.connect(new InetSocketAddress(this.address, LISTENING_PORT), 5000);
            sock.close();
            powerState = PowerState.ON;
        } catch (IOException e) {
            LOGGER.warn("Could not connect to xbox %s at %d", this.address, LISTENING_PORT);
        }

        return new XBoxDeviceStatus(powerState);
    }
}
