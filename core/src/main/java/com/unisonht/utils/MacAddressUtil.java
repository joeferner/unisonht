package com.unisonht.utils;

import java.net.NetworkInterface;
import java.util.Enumeration;

public class MacAddressUtil {
    public static String macToString(byte[] macBytes) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < macBytes.length; i++) {
            if (i != 0) {
                sb.append(':');
            }
            sb.append(String.format("%02x", macBytes[i]));
        }
        return sb.toString();
    }

    public static byte[] getMacBytes(String macStr) throws IllegalArgumentException {
        byte[] bytes = new byte[6];
        String[] hex = macStr.split("(\\:|\\-)");
        if (hex.length != 6) {
            throw new IllegalArgumentException("Invalid MAC address.");
        }
        try {
            for (int i = 0; i < 6; i++) {
                bytes[i] = (byte) Integer.parseInt(hex[i], 16);
            }
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid hex digit in MAC address.");
        }
        return bytes;
    }

    public static byte[] getMacAddress() {
        try {
            Enumeration<NetworkInterface> networkInterfaces = NetworkInterface.getNetworkInterfaces();
            byte[] bestGuess = null;
            while (networkInterfaces.hasMoreElements()) {
                NetworkInterface network = networkInterfaces.nextElement();
                if (bestGuess == null) {
                    bestGuess = network.getHardwareAddress();
                } else if (network.getName().startsWith("wlan")) {
                    bestGuess = network.getHardwareAddress();
                }
            }
            return bestGuess;
        } catch (Exception e) {
            throw new UnisonhtException("Could not get MAC address", e);
        }
    }
}
