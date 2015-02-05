package com.unisonht.plugin.lirc;

import com.etsy.net.UnixDomainSocketClient;
import com.unisonht.plugin.Input;
import com.unisonht.utils.ThreadUtil;
import com.unisonht.utils.UnisonhtException;
import com.unisonht.utils.UnisonhtLogger;
import com.unisonht.utils.UnisonhtLoggerFactory;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

/**
 * Code inspired by lircj.
 */
public class LircInput extends Input {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(LircInput.class);
    private LircEventThread eventThread;

    public LircInput(String path) {
        eventThread = new LircEventThread(path, new LircEventListener() {
            @Override
            public void lircEvent(String remoteControlName, String buttonName, int repeatCount) {
                fireEvent(remoteControlName, buttonName, repeatCount);
            }
        });
        eventThread.setDaemon(true);
        eventThread.start();
    }

    public void release() {
        if (eventThread != null) {
            eventThread.stopRunning();
            eventThread.interrupt();
            eventThread = null;
        }
    }

    @Override
    protected void finalize() throws Throwable {
        release();
        super.finalize();
    }

    private static class LircEventThread extends Thread {
        private static final String SIGHUP_LINE = "SIGHUP";
        private static final int REPEAT_COUNT_COMPONENT = 1;
        private static final int BUTTON_NAME_COMPONENT = 2;
        private static final int REMOTE_CONTROL_NAME_COMPONENT = 3;
        private final LircEventListener lircEventListener;
        private boolean run = true;
        private UnixDomainSocketClient socketClient;
        private final BufferedReader socketReader;

        public LircEventThread(String path, LircEventListener lircEventListener) {
            try {
                LOGGER.info("connecting to LIRC: " + path);
                this.lircEventListener = lircEventListener;
                // 1 => stream socket type
                this.socketClient = new UnixDomainSocketClient(path, 1);
                this.socketReader = new BufferedReader(new InputStreamReader(socketClient.getInputStream()));
                LOGGER.debug("connected to LIRC: " + path);
            } catch (IOException e) {
                throw new UnisonhtException("Could not connect to LIRC: " + path, e);
            }
        }

        public void stopRunning() {
            run = false;
        }

        @Override
        public void run() {
            String line;
            String[] components;
            while (run) {
                try {
                    line = socketReader.readLine();
                    LOGGER.debug("LINE>" + line);
                    if (!line.equals(SIGHUP_LINE)) {
                        components = line.split(" ");
                        int repeatCount = Integer.parseInt(components[REPEAT_COUNT_COMPONENT], 16);
                        String buttonName = components[BUTTON_NAME_COMPONENT];
                        String remoteControlName = components[REMOTE_CONTROL_NAME_COMPONENT];
                        try {
                            lircEventListener.lircEvent(remoteControlName, buttonName, repeatCount);
                        } catch (Throwable ex) {
                            LOGGER.error(String.format("Failed in lircEvent(%s, %s, %d)", remoteControlName, buttonName, repeatCount), ex);
                        }
                    }
                } catch (Throwable e) {
                    LOGGER.error("LIRC failure", e);
                    ThreadUtil.sleep(1000);
                }
            }
            try {
                socketReader.close();
            } catch (IOException e) {
                LOGGER.error("Could not close socket", e);
            }
            socketClient.close();
        }
    }

    private static interface LircEventListener {
        void lircEvent(String remoteControlName, String buttonName, int repeatCount);
    }
}
