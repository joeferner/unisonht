package com.unisonht.plugin.projector.epsonNetworkRS232;

import com.unisonht.plugin.Device;
import com.unisonht.utils.UnisonhtException;
import com.unisonht.utils.UnisonhtLogger;
import com.unisonht.utils.UnisonhtLoggerFactory;

import java.io.IOException;
import java.net.Socket;
import java.net.SocketTimeoutException;
import java.util.HashMap;
import java.util.Map;

import static com.google.common.base.Preconditions.checkNotNull;

public class EpsonNetworkRS232ProjectorDevice extends Device {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(EpsonNetworkRS232ProjectorDevice.class);
    private static final int PORT = 23;
    private final String address;
    private final Map<String, String> inputMapping;
    private Socket socket;

    public EpsonNetworkRS232ProjectorDevice(String address, Map<String, String> inputMapping) {
        checkNotNull(address, "address is required");
        this.address = address;
        if (inputMapping == null) {
            inputMapping = new HashMap<>();
        }
        this.inputMapping = inputMapping;
    }

    @Override
    public void ensureOff() {
        writeCommand("PWR OFF");
    }

    @Override
    public void ensureOn() {
        writeCommand("PWR ON");
    }

    @Override
    public void buttonPress(String buttonName) {
        Integer keyCode = toKeyCode(buttonName);
        if (keyCode == null) {
            throw new UnisonhtException("Could not convert to key code: " + buttonName);
        }
        writeCommand("KEY " + Integer.toHexString(keyCode));
    }

    private Integer toKeyCode(String buttonName) {
        buttonName = buttonName.toLowerCase();
        switch (buttonName) {
            case "power":
                return 0x01;
            case "menu":
                return 0x03;
            case "esc":
                return 0x05;
            case "enter":
                return 0x16;
            case "up":
                return 0x35;
            case "down":
                return 0x36;
            case "left":
                return 0x37;
            case "right":
                return 0x38;
            case "source":
                return 0x48;
            default:
                return null;
        }
    }

    @Override
    public void changeInput(String input) {
        String newInput = inputMapping.get(input);
        if (newInput != null) {
            input = newInput;
        }
        Integer sourceCode = toSourceCode(input);
        if (sourceCode == null) {
            throw new UnisonhtException("Invalid source: " + input);
        }
        writeCommand("SOURCE " + Integer.toHexString(sourceCode));
    }

    private Integer toSourceCode(String input) {
        input = input.toLowerCase();
        switch (input) {
            case "hdmi1":
                return 0x30;
            case "hdmi2":
                return 0xA0;
            default:
                return null;
        }
    }

    private Socket ensureConnected() {
        if (socket == null || socket.isClosed() || !socket.isConnected() || socket.isOutputShutdown()) {
            try {
                LOGGER.info("Connecting to projector: " + address + ":" + PORT);
                socket = new Socket(address, PORT);
                socket.setSoTimeout(100);
                LOGGER.info("Connected to projector: " + address + ":" + PORT);
            } catch (IOException ex) {
                throw new UnisonhtException("Could not connect: " + address + ":" + PORT, ex);
            }
        }
        readData();
        return socket;
    }

    private void writeCommand(String command) {
        writeData(command + "\n");
    }

    private void writeData(String command) {
        ensureConnected();
        try {
            socket.getOutputStream().write(command.getBytes());
        } catch (IOException ex) {
            throw new UnisonhtException("Could not write data: " + command, ex);
        }
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
