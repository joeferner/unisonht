package com.unisonht.plugin.tivo;

import com.unisonht.plugin.Device;
import com.unisonht.plugin.status.PowerState;
import com.unisonht.plugin.status.Status;
import com.unisonht.utils.UnisonhtException;
import com.unisonht.utils.UnisonhtLogger;
import com.unisonht.utils.UnisonhtLoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.net.SocketTimeoutException;

import static com.google.common.base.Preconditions.checkNotNull;

public class TivoDevice extends Device {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(TivoDevice.class);
    private static final int TIVO_PORT = 31339;
    private final String address;
    private Socket socket;
    private OutputStream socketOut;
    private InputStream socketIn;

    public TivoDevice(String address) {
        checkNotNull(address, "address is required");
        this.address = address;
    }

    @Override
    public void ensureOff() {

    }

    @Override
    public void ensureOn() {

    }

    @Override
    public void buttonPress(String buttonName) {
        ensureConnected();

        if (buttonName.equalsIgnoreCase("HOME")) {
            buttonName = "TIVO";
        } else if (buttonName.equalsIgnoreCase("FASTFORWARD")) {
            buttonName = "FORWARD";
        } else if (buttonName.equalsIgnoreCase("REWIND")) {
            buttonName = "REVERSE";
        }

        String data = "IRCODE " + buttonName + "\r";
        try {
            LOGGER.debug("Sending: %s", data);
            socketOut.write(data.getBytes());
        } catch (IOException e) {
            LOGGER.error("Could not send %s", data, e);
            if (e.getMessage().equals("Broken pipe")) {
                try {
                    socket.close();
                    socket = null;
                    ensureConnected();
                    LOGGER.debug("Sending (again): %s", data);
                    socketOut.write(data.getBytes());
                } catch (IOException ex) {
                    throw new UnisonhtException("Could not send button press (again): " + buttonName, ex);
                }
            } else {
                throw new UnisonhtException("Could not send button press: " + buttonName, e);
            }
        }
        readData();
    }

    @Override
    public Status getStatus() {
        ensureConnected();
        return new TivoDeviceStatus(socket != null && socket.isConnected() ? PowerState.ON : PowerState.OFF);
    }

    private Socket ensureConnected() {
        if (socket == null || socket.isClosed() || !socket.isConnected() || socket.isOutputShutdown()) {
            try {
                LOGGER.info("Connecting to TiVo: " + address + ":" + TIVO_PORT);
                socket = new Socket(address, TIVO_PORT);
                socket.setSoTimeout(100);
                LOGGER.info("Connected to TiVo: " + address + ":" + TIVO_PORT);
                socketOut = socket.getOutputStream();
                socketIn = socket.getInputStream();
            } catch (IOException e) {
                throw new UnisonhtException("Could not connect: " + address + ":" + TIVO_PORT, e);
            }
        }
        readData();
        return socket;
    }

    private void readData() {
        byte[] data = new byte[10 * 1024];
        try {
            int count = socketIn.read(data);
            if (count > 0) {
                LOGGER.debug("read %s (count: %d)", new String(data, 0, count), count);
            }
        } catch (SocketTimeoutException ex) {
            // OK
        } catch (IOException e) {
            throw new UnisonhtException("Failed to read data from socket", e);
        }
    }
}
