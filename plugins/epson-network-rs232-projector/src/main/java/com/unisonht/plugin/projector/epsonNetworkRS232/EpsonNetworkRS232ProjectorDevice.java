package com.unisonht.plugin.projector.epsonNetworkRS232;

import com.unisonht.plugin.Device;
import com.unisonht.plugin.status.PowerState;
import com.unisonht.plugin.status.StatusInput;
import com.unisonht.utils.UnisonhtException;
import com.unisonht.utils.UnisonhtLogger;
import com.unisonht.utils.UnisonhtLoggerFactory;
import org.apache.commons.io.IOUtils;

import java.io.IOException;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;

import static com.google.common.base.Preconditions.checkNotNull;

public class EpsonNetworkRS232ProjectorDevice extends Device {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(EpsonNetworkRS232ProjectorDevice.class);
    private final String address;
    private final Map<String, String> inputMapping;

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
        try {
            writeCommand("PWR ON");
        } catch (Exception ex) {
            LOGGER.warn("Could not power on first try.");
            writeCommand("PWR ON");
        }
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

    @Override
    public EpsonNetworkRS232ProjectorDeviceStatus getStatus() {
        String result = writeCommand("PWR?");
        PowerState powerState = PowerState.UNKNOWN;
        if (result.equalsIgnoreCase("PWR=01")) {
            powerState = PowerState.ON;
        } else if (result.equalsIgnoreCase("PWR=00")) {
            powerState = PowerState.OFF;
        }

        StatusInput.Input input = null;
        if (powerState == PowerState.ON) {
            result = writeCommand("SOURCE?");
            if (result.startsWith("SOURCE=")) {
                input = fromSourceCode(result.substring("SOURCE=".length()));
            } else {
                input = new StatusInput.Input(result, null);
            }
        }

        return new EpsonNetworkRS232ProjectorDeviceStatus(powerState, input);
    }

    private StatusInput.Input fromSourceCode(String sourceCode) {
        sourceCode = sourceCode.toLowerCase();
        String input;
        switch (sourceCode) {
            case "30":
                input = "hdmi1";
                break;
            case "a0":
                input = "hdmi2";
                break;
            default:
                return new StatusInput.Input(sourceCode, null);
        }
        for (Map.Entry<String, String> entry : this.inputMapping.entrySet()) {
            if (entry.getValue().equalsIgnoreCase(input)) {
                return new StatusInput.Input(entry.getValue(), entry.getKey());
            }
        }
        return new StatusInput.Input(input, null);
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

    private String writeCommand(String command) {
        try {
            return writeData(("q=" + URLEncoder.encode(command + "\r\n", "utf8")).getBytes());
        } catch (UnsupportedEncodingException e) {
            throw new UnisonhtException("Could not encode data", e);
        }
    }

    private String writeData(byte[] data) {
        try {
            LOGGER.debug("writing data: %s", new String(data));
            String urlString = String.format("http://%s/send", address);
            URL url;
            try {
                url = new URL(urlString);
            } catch (MalformedURLException e) {
                throw new UnisonhtException("Bad URL", e);
            }
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setConnectTimeout(1000);
            conn.setReadTimeout(30 * 1000);
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Length", "" + Integer.toString(data.length));
            conn.setDoInput(true);
            conn.setDoOutput(true);

            OutputStream out = conn.getOutputStream();
            out.write(data);
            out.flush();
            out.close();

            String result = IOUtils.toString(conn.getInputStream()).trim();
            LOGGER.debug("page result:\n%s", result);
            return result;
        } catch (IOException ex) {
            throw new UnisonhtException("Could not write data: " + new String(data), ex);
        }
    }
}
