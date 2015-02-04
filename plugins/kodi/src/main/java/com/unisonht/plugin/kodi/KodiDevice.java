package com.unisonht.plugin.kodi;

import com.unisonht.plugin.Device;
import com.unisonht.utils.UnisonhtException;
import com.unisonht.utils.UnisonhtLogger;
import com.unisonht.utils.UnisonhtLoggerFactory;
import com.unisonht.utils.WakeOnLan;
import org.json.JSONObject;

import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.SocketAddress;

import static com.google.common.base.Preconditions.checkNotNull;

public class KodiDevice extends Device {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(KodiDevice.class);
    public static final int KODI_JSON_PORT = 9090;
    private final String address;
    private final String macAddress;
    private Socket socket;

    public KodiDevice(String address, String macAddress) {
        checkNotNull(address, "address is required");
        this.address = address;
        this.macAddress = macAddress;
    }

    @Override
    public void ensureOff() {
        sendShutdown();
    }

    @Override
    public void ensureOn() {
        sendWakeOnLan();
        for (int i = 0; i < 60; i++) {
            try {
                getStatus();
                return;
            } catch (Exception ex) {
                LOGGER.debug("trying to get status: " + address + ":" + KODI_JSON_PORT, ex);
            }
            sendWakeOnLan();
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                LOGGER.error("Could not sleep", e);
            }
        }
        try {
            getStatus();
        } catch (Exception ex) {
            throw new UnisonhtException("Could not get status: " + address + ":" + KODI_JSON_PORT, ex);
        }
    }

    @Override
    public void buttonPress(String buttonName) {
        if (buttonName.equalsIgnoreCase("UP")) {
            sendInput("Up");
        } else if (buttonName.equalsIgnoreCase("DOWN")) {
            sendInput("Down");
        } else if (buttonName.equalsIgnoreCase("LEFT")) {
            sendInput("Left");
        } else if (buttonName.equalsIgnoreCase("RIGHT")) {
            sendInput("Right");
        } else if (buttonName.equalsIgnoreCase("SELECT")) {
            sendInput("Select");
        } else if (buttonName.equalsIgnoreCase("HOME")) {
            sendInput("Home");
        } else if (buttonName.equalsIgnoreCase("BACK")) {
            sendInput("Back");
        } else if (buttonName.equalsIgnoreCase("INFO")) {
            sendInput("Info");
        } else if (buttonName.equalsIgnoreCase("GUIDE")) {
            sendInput("ContextMenu");
        } else {
            sendInput(buttonName);
        }
    }

    private JSONObject sendInput(String inputCommand) {
        JSONObject json = new JSONObject();
        json.put("jsonrpc", "2.0");
        json.put("method", "Input." + inputCommand);
        json.put("id", (int) System.currentTimeMillis());
        return sendJsonRequest(json);
    }

    private void sendWakeOnLan() {
        if (this.macAddress == null) {
            LOGGER.warn("Cannot send wake on lan because no MAC address was specified in the config.");
            return;
        }
        WakeOnLan.send(macAddress);
    }

    private JSONObject sendShutdown() {
        JSONObject json = new JSONObject();
        json.put("jsonrpc", "2.0");
        json.put("method", "System.Shutdown");
        json.put("id", (int) System.currentTimeMillis());
        return sendJsonRequest(json);
    }

    private JSONObject getStatus() {
        JSONObject json = new JSONObject();
        json.put("jsonrpc", "2.0");
        json.put("method", "JSONRPC.Version");
        json.put("id", (int) System.currentTimeMillis());
        return sendJsonRequest(json);
    }

    private JSONObject sendJsonRequest(JSONObject json) {
        try {
            Socket s;
            if (socket == null) {
                SocketAddress sockAddr = new InetSocketAddress(address, KODI_JSON_PORT);
                s = new Socket();
                s.setSoTimeout(1000);
                s.connect(sockAddr, 1000);
            } else {
                s = socket;
            }

            LOGGER.debug("sending request: %s", json.toString());
            s.getOutputStream().write(json.toString().getBytes());
            byte[] buffer = new byte[10 * 1000];
            int count = s.getInputStream().read(buffer);
            if (count == -1) {
                socket = null;
                throw new UnisonhtException("Failed to read");
            }
            String results = new String(buffer, 0, count);
            LOGGER.debug("json response: %s", results);
            LOGGER.error("TODO check results for error");
            socket = s;
            return new JSONObject(results);
        } catch (Exception ex) {
            throw new UnisonhtException("Could not send JSON request: " + json, ex);
        }
    }
}
