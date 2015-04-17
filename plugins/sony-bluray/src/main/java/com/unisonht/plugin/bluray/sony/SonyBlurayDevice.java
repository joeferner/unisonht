package com.unisonht.plugin.bluray.sony;

import com.unisonht.plugin.Device;
import com.unisonht.plugin.status.PowerState;
import com.unisonht.plugin.status.Status;
import com.unisonht.services.ButtonPressListener;
import com.unisonht.services.RemoteService;
import com.unisonht.utils.*;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.io.IOUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.IOException;
import java.io.StringReader;
import java.io.UnsupportedEncodingException;
import java.net.*;
import java.util.HashMap;
import java.util.Map;

import static com.google.common.base.Preconditions.checkNotNull;

public class SonyBlurayDevice extends Device {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(SonyBlurayDevice.class);
    public static final int IRCC_PORT = 50001;
    public static final int PORT = 50002;
    public static final String DEFAULT_DEVICE_ID_PREFIX = "UnisonHT";
    public static final String DEFAULT_DEVICE_NAME = "UnisonHT";
    private final String address;
    private final String macAddress;
    private final RemoteService remoteService;
    private final DocumentBuilder builder;
    private String deviceIdPrefix;
    private String deviceName = DEFAULT_DEVICE_NAME;
    private Map<String, String> commandMap = new HashMap<>();

    public SonyBlurayDevice(RemoteService remoteService, String address, String macAddress) {
        this.remoteService = remoteService;
        checkNotNull(address, "address is required");
        this.address = address;
        this.macAddress = macAddress;
        this.deviceIdPrefix = DEFAULT_DEVICE_ID_PREFIX;

        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            builder = factory.newDocumentBuilder();
        } catch (Exception ex) {
            throw new UnisonhtException("Could not create XML builder", ex);
        }
    }

    @Override
    public void ensureOff() {
        LOGGER.error("TODO ensureOff");
    }

    @Override
    public void ensureOn() {
        sendWakeOnLan();
        for (int i = 0; i < 60; i++) {
            try {
                getStatus();
                getRemoteCommandList();
                return;
            } catch (Exception ex) {
                LOGGER.debug("trying to get status: " + address + ":" + PORT, ex);
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
            throw new UnisonhtException("Could not get status: " + address + ":" + PORT, ex);
        }
    }

    private void getRemoteCommandList() {
        commandMap.clear();
        String remoteCommandList = getPage("/getRemoteCommandList");
        try {
            Document doc = builder.parse(new InputSource(new StringReader(remoteCommandList)));
            NodeList commandElements = doc.getElementsByTagName("command");
            for (int i = 0; i < commandElements.getLength(); i++) {
                Element commandElement = (Element) commandElements.item(i);
                String commandName = commandElement.getAttribute("name").toUpperCase();
                String commandValue = commandElement.getAttribute("value");
                commandMap.put(commandName, commandValue);
            }
        } catch (Exception e) {
            throw new UnisonhtException("Could not parse remove command line", e);
        }
    }

    @Override
    public void buttonPress(String buttonName) {
        String sonyCommand = buttonName;

        if (sonyCommand.equalsIgnoreCase("SELECT")) {
            sonyCommand = "Confirm";
        } else if (sonyCommand.equalsIgnoreCase("FASTFORWARD")) {
            sonyCommand = "Forward";
        } else if (sonyCommand.equalsIgnoreCase("SKIP")) {
            sonyCommand = "Next";
        } else if (sonyCommand.equalsIgnoreCase("REPLAY")) {
            sonyCommand = "Prev";
        }
        String commandValue = commandMap.get(sonyCommand.toUpperCase());
        if (commandValue == null) {
            throw new UnisonhtException("Could not find sony command with name: " + sonyCommand);
        }

        StringBuilder body = new StringBuilder();
        body.append("<?xml version=\"1.0\"?>\n");
        body.append("<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\" s:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\">\n");
        body.append("  <s:Body>\n");
        body.append("   <u:X_SendIRCC xmlns:u=\"urn:schemas-sony-com:service:IRCC:1\">\n");
        body.append("      <IRCCCode>").append(commandValue).append("</IRCCCode>\n");
        body.append("    </u:X_SendIRCC>\n");
        body.append("  </s:Body>\n");
        body.append("</s:Envelope>\n");

        String urlString = String.format("http://%s:%d/upnp/control/IRCC", address, IRCC_PORT);
        LOGGER.debug("getting page: %s\n%s", urlString, body.toString());
        URL url;
        try {
            url = new URL(urlString);
        } catch (MalformedURLException e) {
            throw new UnisonhtException("Bad URL", e);
        }

        try {
            byte[] bodyBytes = body.toString().getBytes();

            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setConnectTimeout(1000);
            conn.setReadTimeout(10 * 1000);
            conn.setRequestMethod("POST");
            conn.setRequestProperty("X-CERS-DEVICE-ID", getDeviceId());
            conn.setRequestProperty("X-CERS-DEVICE-INFO", "Android4.4.2/TVSideViewForAndroid2.5.1/SM-G900V");
            conn.setRequestProperty("Connection", "close");
            conn.setRequestProperty("User-Agent", "Dalvik/1.6.0 (Linux; U; Android 4.4.2; SM-G900V Build/KOT49H)");
            conn.setRequestProperty("content-type", "text/xml; charset=utf-8");
            conn.setRequestProperty("soapaction", "\"urn:schemas-sony-com:service:IRCC:1#X_SendIRCC\"");
            conn.setRequestProperty("Content-Length", "" + bodyBytes.length);
            conn.setDoOutput(true);

            conn.getOutputStream().write(bodyBytes);

            String result = IOUtils.toString(conn.getInputStream());
            LOGGER.debug("page result:\n%s", result);
        } catch (IOException e) {
            throw new UnisonhtException("Could not get page: " + urlString + "(" + e.getMessage() + ")", e);
        }
    }

    private void sendWakeOnLan() {
        if (this.macAddress == null) {
            LOGGER.warn("Cannot send wake on lan because no MAC address was specified in the config.");
            return;
        }
        WakeOnLan.send(macAddress);
    }

    public Status getStatus() {
        try {
            String statusPage = getPage("getStatus");
            return new SonyBlurayDeviceStatus(PowerState.UNKNOWN);
        } catch (UnisonhtException ex) {
            if (ex.getCause() != null && ex.getCause() instanceof ConnectException && ex.getCause().getMessage().equals("Connection refused")) {
                return new SonyBlurayDeviceStatus(PowerState.OFF);
            }
            throw ex;
        }
    }

    private String getPage(String page) {
        return getPage(page, null, true);
    }

    private String getPage(String page, String authCode, boolean registerOnFail) {
        String urlString = String.format("http://%s:%d/%s", address, PORT, page);
        LOGGER.debug("getting page: %s", urlString);
        URL url;
        try {
            url = new URL(urlString);
        } catch (MalformedURLException e) {
            throw new UnisonhtException("Bad URL", e);
        }

        try {
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setConnectTimeout(1000);
            conn.setReadTimeout(10 * 1000);
            conn.setRequestMethod("GET");
            conn.setRequestProperty("X-CERS-DEVICE-ID", getDeviceId());
            conn.setRequestProperty("X-CERS-DEVICE-INFO", "Android4.4.2/TVSideViewForAndroid2.5.1/SM-G900V");
            conn.setRequestProperty("Connection", "close");
            conn.setRequestProperty("User-Agent", "Dalvik/1.6.0 (Linux; U; Android 4.4.2; SM-G900V Build/KOT49H)");
            if (authCode != null) {
                String pass = Base64.encodeBase64String((":" + authCode).getBytes());
                conn.setRequestProperty("Authorization", "Basic " + pass);
            }

            String result = IOUtils.toString(conn.getInputStream());
            LOGGER.debug("page result:\n%s", result);
            return result;
        } catch (IOException e) {
            if (registerOnFail && e.getMessage().contains("403")) {
                if (tryRegistering()) {
                    return getPage(page, authCode, false);
                }
            }
            throw new UnisonhtException("Could not get page: " + urlString + "(" + e.getMessage() + ")", e);
        }
    }

    private boolean tryRegistering() {
        try {
            String page = getPage(getRegistrationUrl("renewal"), null, false);
            LOGGER.debug("got renewal: %s", page);
            return true;
        } catch (Exception exRenewal) {
            if (exRenewal.getMessage().contains("403")) {
                try {
                    String page = getPage(getRegistrationUrl("initial"), null, false);
                    LOGGER.debug("got initial: %s", page);
                    return true;
                } catch (Exception exInitial) {
                    if (exInitial.getMessage().contains("401")) {
                        GetCodeButtonPressListener getCodeButtonPressListener = new GetCodeButtonPressListener();
                        remoteService.registerButtonPressListener(getCodeButtonPressListener);
                        try {
                            long endTime = System.currentTimeMillis() + (70 * 1000);
                            while (getCodeButtonPressListener.getCode() == null && System.currentTimeMillis() < endTime) {
                                ThreadUtil.sleep(100);
                            }
                            if (getCodeButtonPressListener.getCode() != null) {
                                String authCode = getCodeButtonPressListener.getCode();
                                String page = getPage(getRegistrationUrl("initial"), authCode, false);
                                LOGGER.debug("got initial: %s", page);
                                return true;
                            } else {
                                LOGGER.error("Failed to get auth code");
                                return false;
                            }
                        } finally {
                            remoteService.unregisterButtonPressListener(getCodeButtonPressListener);
                        }
                    } else {
                        LOGGER.error("failed to get renewal", exRenewal);
                        return false;
                    }
                }
            } else {
                LOGGER.error("failed to get renewal", exRenewal);
                return false;
            }
        }
    }

    private String getRegistrationUrl(String type) {
        try {
            return String.format(
                    "register?name=%s&registrationType=%s&deviceId=%s&wolSupport=true",
                    URLEncoder.encode(deviceName, "utf8"),
                    type,
                    URLEncoder.encode(getDeviceId(), "utf8"));
        } catch (UnsupportedEncodingException e) {
            throw new UnisonhtException("Could not get url", e);
        }
    }

    private String getDeviceId() {
        String myMacAddress = MacAddressUtil.macToString(MacAddressUtil.getMacAddress());
        return deviceIdPrefix + ":" + myMacAddress.replace(':', '-');
    }

    private static class GetCodeButtonPressListener implements ButtonPressListener {
        private final StringBuilder codeBuilder = new StringBuilder();

        public String getCode() {
            if (codeBuilder.length() == 4) {
                return codeBuilder.toString();
            }
            return null;
        }

        @Override
        public boolean handle(String remoteName, String buttonName) {
            if (buttonName.startsWith("NUM") && buttonName.length() == 4) {
                codeBuilder.append(buttonName.substring("NUM".length()));
                return true;
            } else if (buttonName.length() == 1 && Character.isDigit(buttonName.charAt(0))) {
                codeBuilder.append(buttonName);
                return true;
            }
            return false;
        }
    }
}
