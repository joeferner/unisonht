package com.unisonht;

import com.unisonht.utils.UnisonhtLogger;
import com.unisonht.utils.UnisonhtLoggerFactory;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.SocketException;

public class Log4jUdpListener {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(Log4jUdpListener.class);
    private static final int LOG4J_UDP_PORT = 9991;

    public static void main(String[] args) throws SocketException {
        new Log4jUdpListener().run(args);
    }

    private void run(String[] args) throws SocketException {
        DatagramSocket serverSocket = new DatagramSocket(LOG4J_UDP_PORT);
        byte[] receiveData = new byte[1024];
        while (true) {
            try {
                DatagramPacket receivePacket = new DatagramPacket(receiveData, receiveData.length);
                serverSocket.receive(receivePacket);
                String receiveDataString = new String(receivePacket.getData(), 0, receivePacket.getLength()).trim();
                if (receiveDataString.contains("contiki: udp: no matching connection found")
                        || receiveDataString.contains("contiki: ip: invalid version or header length")) {
                    continue;
                }
                InetAddress receiveAddress = receivePacket.getAddress();
                LOGGER.info("%s: %s", receiveAddress, receiveDataString);
            } catch (IOException e) {
                LOGGER.error("failed to receive packet", e);
            }
        }
    }
}
