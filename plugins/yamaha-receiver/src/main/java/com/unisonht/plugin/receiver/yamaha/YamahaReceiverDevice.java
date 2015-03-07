package com.unisonht.plugin.receiver.yamaha;

import com.unisonht.plugin.Device;
import com.unisonht.utils.UnisonhtException;
import com.unisonht.utils.UnisonhtLogger;
import com.unisonht.utils.UnisonhtLoggerFactory;
import org.apache.commons.io.IOUtils;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
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
        String command = "<YAMAHA_AV cmd=\"PUT\"><Main_Zone><Power_Control><Power>Standby</Power></Power_Control></Main_Zone></YAMAHA_AV>";
        sendXMLToReceiver(command);
    }

    @Override
    public void ensureOn() {
        String command = "<YAMAHA_AV cmd=\"PUT\"><Main_Zone><Power_Control><Power>On</Power></Power_Control></Main_Zone></YAMAHA_AV>";
        sendXMLToReceiver(command);
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

        changeInput("Main_Zone", input);
    }

    public void changeInput(String zone, String input) {
        String command = "<YAMAHA_AV cmd=\"PUT\"><" + zone + "><Input><Input_Sel>" + input + "</Input_Sel></Input></" + zone + "></YAMAHA_AV>";
        sendXMLToReceiver(command);
    }

    private void sendXMLToReceiver(String command) {
        URL url;
        try {
            url = new URL("http://" + this.address + "/YamahaRemoteControl/ctrl");
        } catch (MalformedURLException e) {
            throw new UnisonhtException("Bad URL", e);
        }

        try {
            LOGGER.debug("sending command to %s: %s", url.toString(), command);
            byte[] bodyBytes = command.getBytes();

            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setConnectTimeout(1000);
            conn.setReadTimeout(10 * 1000);
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Connection", "close");
            conn.setRequestProperty("User-Agent", "Dalvik/1.6.0 (Linux; U; Android 4.4.2; SM-G900V Build/KOT49H)");
            conn.setRequestProperty("content-type", "text/xml; charset=utf-8");
            conn.setRequestProperty("Content-Length", "" + bodyBytes.length);
            conn.setDoOutput(true);

            conn.getOutputStream().write(bodyBytes);

            String result = IOUtils.toString(conn.getInputStream());
            LOGGER.debug("result: " + result);
        } catch (IOException e) {
            throw new UnisonhtException("Could not get page: " + url + "(" + e.getMessage() + ")", e);
        }
    }
}
