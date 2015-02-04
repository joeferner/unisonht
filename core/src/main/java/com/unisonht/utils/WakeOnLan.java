package com.unisonht.utils;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;

public class WakeOnLan {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(WakeOnLan.class);
    public static final int PORT = 9;

    public static void send(String macAddress) {
        byte[] macBytes = getMacBytes(macAddress);
        send(macBytes);
    }

    public static void send(byte[] macBytes) {
        try {
            LOGGER.debug("Sending wake on lan to %s.", macToString(macBytes));
            byte[] bytes = new byte[6 + 16 * macBytes.length];
            for (int i = 0; i < 6; i++) {
                bytes[i] = (byte) 0xff;
            }
            for (int i = 6; i < bytes.length; i += macBytes.length) {
                System.arraycopy(macBytes, 0, bytes, i, macBytes.length);
            }

            byte b = (byte) 255;
            InetAddress address = InetAddress.getByAddress(new byte[]{b, b, b, b});
            DatagramPacket packet = new DatagramPacket(bytes, bytes.length, address, PORT);
            DatagramSocket socket = new DatagramSocket();
            socket.send(packet);
            socket.close();

            LOGGER.debug("Wake-on-LAN packet sent.");
        } catch (Exception e) {
            throw new UnisonhtException("Could not send wake on lan", e);
        }
    }

    private static String macToString(byte[] macBytes) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < macBytes.length; i++) {
            if (i != 0) {
                sb.append(':');
            }
            sb.append(String.format("%02x", macBytes[i]));
        }
        return sb.toString();
    }

    private static byte[] getMacBytes(String macStr) throws IllegalArgumentException {
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
}
