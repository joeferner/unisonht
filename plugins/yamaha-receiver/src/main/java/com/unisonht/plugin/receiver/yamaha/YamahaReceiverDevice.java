package com.unisonht.plugin.receiver.yamaha;

import com.unisonht.plugin.Device;
import com.unisonht.plugin.status.PowerState;
import com.unisonht.plugin.status.Status;
import com.unisonht.plugin.status.StatusInput;
import com.unisonht.utils.UnisonhtException;
import com.unisonht.utils.UnisonhtLogger;
import com.unisonht.utils.UnisonhtLoggerFactory;
import com.unisonht.utils.XmlUtils;
import org.apache.commons.io.IOUtils;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.StringReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

import static com.google.common.base.Preconditions.checkNotNull;

public class YamahaReceiverDevice extends Device {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(YamahaReceiverDevice.class);
    public static final String ZONE_MAIN = "Main_Zone";
    private final String address;
    private final Map<String, String> inputMapping;
    private final DocumentBuilder builder;

    public YamahaReceiverDevice(String address, Map<String, String> inputMapping) {
        checkNotNull(address, "address is required");
        this.address = address;
        if (inputMapping == null) {
            inputMapping = new HashMap<>();
        }
        this.inputMapping = inputMapping;

        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            builder = factory.newDocumentBuilder();
        } catch (Exception ex) {
            throw new UnisonhtException("Could not create XML builder", ex);
        }
    }

    @Override
    public void ensureOff() {
        putXml(ZONE_MAIN, "<Power_Control><Power>Standby</Power></Power_Control>");
    }

    @Override
    public void ensureOn() {
        putXml(ZONE_MAIN, "<Power_Control><Power>On</Power></Power_Control>");
    }

    private void putXml(String zone, String content) {
        String command = "<YAMAHA_AV cmd=\"PUT\"><" + zone + ">" + content + "</" + zone + "></YAMAHA_AV>";
        sendXMLToReceiver(command);
    }

    private Document getXml(String zone, String content) {
        String command = "<YAMAHA_AV cmd=\"GET\"><" + zone + ">" + content + "</" + zone + "></YAMAHA_AV>";
        return sendXMLToReceiver(command);
    }

    @Override
    public void buttonPress(String buttonName) {
        if (buttonName.equalsIgnoreCase("MUTE")) {
            toggleMute(ZONE_MAIN);
        } else if (buttonName.equalsIgnoreCase("VOLUMEUP")) {
            changeVolume(ZONE_MAIN, 0.5);
        } else if (buttonName.equalsIgnoreCase("VOLUMEDOWN")) {
            changeVolume(ZONE_MAIN, -0.5);
        } else {
            LOGGER.warn("Invalid button name: %s", buttonName);
        }
    }

    private void changeVolume(String zone, double amount) {
        String content = String.format(
                "<Volume><Lvl><Val>%s%s</Val><Exp></Exp><Unit></Unit></Lvl></Volume>",
                amount > 0 ? "Up" : "Down",
                Math.abs(amount) == 0.5 ? "" : String.format(" %f dB ", Math.abs(amount))
        );
        putXml(zone, content);
    }

    public void toggleMute(String zone) {
        if (isMuted(zone)) {
            muteOff(zone);
        } else {
            muteOn(zone);
        }
    }

    private void muteOn(String zone) {
        putXml(zone, "<Volume><Mute>On</Mute></Volume>");
    }

    private void muteOff(String zone) {
        putXml(zone, "<Volume><Mute>Off</Mute></Volume>");
    }

    private boolean isMuted(String zone) {
        return isStatusParamOn(zone, "Mute");
    }

    private boolean isStatusParamOn(String zone, String param) {
        String statusString = getStatusString(zone, param);
        return statusString.equalsIgnoreCase("on");
    }

    private String getStatusString(String zone, String param) {
        Document xml = getBasicStatus(zone);
        NodeList elems = xml.getElementsByTagName(param);
        if (elems.getLength() == 0) {
            throw new UnisonhtException("Could not find param " + param + " in xml: " + xml);
        }
        return elems.item(0).getTextContent();
    }

    private Document getBasicStatus(String zone) {
        return getXml(zone, "<Basic_Status>GetParam</Basic_Status>");
    }

    @Override
    public void changeInput(String input) {
        String newInput = inputMapping.get(input);
        if (newInput != null) {
            input = newInput;
        }

        changeInput(ZONE_MAIN, input);
    }

    @Override
    public Status getStatus() {
        Document xml = getBasicStatus(ZONE_MAIN);
        String powerString = XmlUtils.getString(xml, "/YAMAHA_AV/Main_Zone/Basic_Status/Power_Control/Power");
        PowerState powerState = PowerState.UNKNOWN;
        if (powerString.equalsIgnoreCase("on")) {
            powerState = PowerState.ON;
        } else if (powerString.equalsIgnoreCase("off")) {
            powerState = PowerState.OFF;
        }

        String volumeString = XmlUtils.getString(xml, "/YAMAHA_AV/Main_Zone/Basic_Status/Volume/Lvl/Val");
        double volume = parseVolume(volumeString);

        String inputString = XmlUtils.getString(xml, "/YAMAHA_AV/Main_Zone/Basic_Status/Input/Input_Sel");
        StatusInput.Input input = fromDeviceInput(inputString);

        return new YamahaReceiverDeviceStatus(powerState, volume, input);
    }

    private StatusInput.Input fromDeviceInput(String inputString) {
        for (Map.Entry<String, String> e : this.inputMapping.entrySet()) {
            if (e.getValue().equalsIgnoreCase(inputString)) {
                return new StatusInput.Input(e.getKey(), e.getValue());
            }
        }
        return new StatusInput.Input(inputString, null);
    }

    private double parseVolume(String volumeString) {
        return Double.parseDouble(volumeString) / 10.0;
    }

    public void changeInput(String zone, String input) {
        String command = "<YAMAHA_AV cmd=\"PUT\"><" + zone + "><Input><Input_Sel>" + input + "</Input_Sel></Input></" + zone + "></YAMAHA_AV>";
        sendXMLToReceiver(command);
    }

    private Document sendXMLToReceiver(String command) {
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
            return builder.parse(new InputSource(new StringReader(result)));
        } catch (Exception e) {
            throw new UnisonhtException("Could not get page: " + url + "(" + e.getMessage() + ")", e);
        }
    }
}
