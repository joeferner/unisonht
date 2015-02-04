package com.unisonht.plugin.tivo;

import com.unisonht.plugin.Device;
import com.unisonht.utils.UnisonhtException;
import com.unisonht.utils.UnisonhtLogger;
import com.unisonht.utils.UnisonhtLoggerFactory;

import java.io.IOException;
import java.net.Socket;
import java.net.SocketTimeoutException;

import static com.google.common.base.Preconditions.checkNotNull;

public class TivoDevice extends Device {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(TivoDevice.class);
    private static final int TIVO_PORT = 31339;
    private final String address;
    private Socket socket;

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
        Socket s = ensureConnected();

        String data = "IRCODE " + buttonName + "\r";
        try {
            LOGGER.debug("Sending: %s", data);
            s.getOutputStream().write(data.getBytes());
        } catch (IOException e) {
            throw new UnisonhtException("Could not send button press: " + buttonName, e);
        }
        readData();
    }

    private Socket ensureConnected() {
        if (socket == null || socket.isClosed() || !socket.isConnected() || socket.isOutputShutdown()) {
            try {
                LOGGER.info("Connecting to TiVo: " + address + ":" + TIVO_PORT);
                socket = new Socket(address, TIVO_PORT);
                socket.setSoTimeout(100);
                LOGGER.info("Connected to TiVo: " + address + ":" + TIVO_PORT);
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
            int count = socket.getInputStream().read(data);
            LOGGER.debug("read %s (count: %d)", new String(data, 0, count), count);
        } catch (SocketTimeoutException ex) {
            // OK
        } catch (IOException e) {
            throw new UnisonhtException("Failed to read data from socket", e);
        }
    }
}
