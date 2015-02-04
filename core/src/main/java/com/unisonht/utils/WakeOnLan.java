package com.unisonht.utils;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;

public class WakeOnLan {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(WakeOnLan.class);
    public static final int PORT = 9;

    public static void send(String macAddress) {
        byte[] macBytes = MacAddressUtil.getMacBytes(macAddress);
        send(macBytes);
    }

    public static void send(byte[] macBytes) {
        try {
            LOGGER.debug("Sending wake on lan to %s.", MacAddressUtil.macToString(macBytes));
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


}
