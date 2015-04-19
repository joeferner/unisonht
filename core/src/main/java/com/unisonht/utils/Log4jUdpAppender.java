package com.unisonht.utils;

import org.apache.log4j.AppenderSkeleton;
import org.apache.log4j.Layout;
import org.apache.log4j.helpers.LogLog;
import org.apache.log4j.net.ZeroConfSupport;
import org.apache.log4j.spi.LoggingEvent;
import org.apache.log4j.xml.XMLLayout;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.UnknownHostException;

public class Log4jUdpAppender extends AppenderSkeleton {
    public static final int DEFAULT_PORT = 9991;
    String hostname;
    String remoteHost;
    String application;
    String encoding;
    InetAddress address;
    int port = 9991;
    DatagramSocket outSocket;
    public static final String ZONE = "_log4j_xml_udp_appender.local.";
    boolean inError = false;
    private boolean advertiseViaMulticastDNS;
    private ZeroConfSupport zeroConf;

    public Log4jUdpAppender() {
        super(false);
    }

    public Log4jUdpAppender(InetAddress address, int port) {
        super(false);
        this.address = address;
        this.remoteHost = address.getHostName();
        this.port = port;
        this.activateOptions();
    }

    public Log4jUdpAppender(String host, int port) {
        super(false);
        this.port = port;
        this.address = this.getAddressByName(host);
        this.remoteHost = host;
        this.activateOptions();
    }

    public void activateOptions() {
        try {
            this.hostname = InetAddress.getLocalHost().getHostName();
        } catch (UnknownHostException var4) {
            try {
                this.hostname = InetAddress.getLocalHost().getHostAddress();
            } catch (UnknownHostException var3) {
                this.hostname = "unknown";
            }
        }

        if (this.application == null) {
            this.application = System.getProperty("application");
        } else if (System.getProperty("application") != null) {
            this.application = this.application + "-" + System.getProperty("application");
        }

        if (this.remoteHost != null) {
            this.address = this.getAddressByName(this.remoteHost);
            this.connect(this.address, this.port);
            if (this.layout == null) {
                this.layout = new XMLLayout();
            }

            if (this.advertiseViaMulticastDNS) {
                this.zeroConf = new ZeroConfSupport("_log4j_xml_udp_appender.local.", this.port, this.getName());
                this.zeroConf.advertise();
            }

            super.activateOptions();
        } else {
            String err = "The RemoteHost property is required for SocketAppender named " + this.name;
            LogLog.error(err);
            throw new IllegalStateException(err);
        }
    }

    public synchronized void close() {
        if (!this.closed) {
            if (this.advertiseViaMulticastDNS) {
                this.zeroConf.unadvertise();
            }

            this.closed = true;
            this.cleanUp();
        }
    }

    public void cleanUp() {
        if (this.outSocket != null) {
            try {
                this.outSocket.close();
            } catch (Exception var2) {
                LogLog.error("Could not close outSocket.", var2);
            }

            this.outSocket = null;
        }

    }

    void connect(InetAddress address, int port) {
        if (this.address != null) {
            try {
                this.cleanUp();
                this.outSocket = new DatagramSocket();
                this.outSocket.connect(address, port);
            } catch (IOException var4) {
                LogLog.error("Could not open UDP Socket for sending.", var4);
                this.inError = true;
            }

        }
    }

    public void append(LoggingEvent event) {
        if (!this.inError) {
            if (event != null) {
                if (this.address != null) {
                    if (this.outSocket != null) {
                        event.setProperty("hostname", this.hostname);
                        if (this.application != null) {
                            event.setProperty("application", this.application);
                        }

                        try {
                            StringBuffer e = new StringBuffer(this.layout.format(event));
                            if (this.layout.ignoresThrowable()) {
                                String[] s = event.getThrowableStrRep();
                                if (s != null) {
                                    for (String value : s) {
                                        e.append(value);
                                        e.append(Layout.LINE_SEP);
                                    }
                                }
                            }
                            byte[] payload;
                            if (this.encoding == null) {
                                payload = e.toString().getBytes();
                            } else {
                                payload = e.toString().getBytes(this.encoding);
                            }

                            DatagramPacket dp = new DatagramPacket(payload, payload.length, this.address, this.port);
                            this.outSocket.send(dp);
                        } catch (IOException var5) {
                            this.outSocket = null;
                            LogLog.warn("Detected problem with UDP connection: " + var5);
                        }
                    }

                }
            }
        }
    }

    public boolean isActive() {
        return !this.inError;
    }

    InetAddress getAddressByName(String host) {
        try {
            return InetAddress.getByName(host);
        } catch (Exception var3) {
            LogLog.error("Could not find address of [" + host + "].", var3);
            return null;
        }
    }

    public boolean requiresLayout() {
        return true;
    }

    public void setRemoteHost(String host) {
        this.remoteHost = host;
    }

    public String getRemoteHost() {
        return this.remoteHost;
    }

    public void setApplication(String app) {
        this.application = app;
    }

    public String getApplication() {
        return this.application;
    }

    public void setEncoding(String encoding) {
        this.encoding = encoding;
    }

    public String getEncoding() {
        return this.encoding;
    }

    public void setPort(int port) {
        this.port = port;
    }

    public int getPort() {
        return this.port;
    }

    public void setAdvertiseViaMulticastDNS(boolean advertiseViaMulticastDNS) {
        this.advertiseViaMulticastDNS = advertiseViaMulticastDNS;
    }

    public boolean isAdvertiseViaMulticastDNS() {
        return this.advertiseViaMulticastDNS;
    }
}
