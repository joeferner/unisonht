package com.unisonht.plugin.imageViewer;

import com.unisonht.config.Configuration;
import com.unisonht.plugin.Device;
import com.unisonht.plugin.status.Status;
import com.unisonht.plugin.status.StatusUnknown;
import com.unisonht.utils.ThreadUtil;
import com.unisonht.utils.UnisonhtException;
import com.unisonht.utils.UnisonhtLogger;
import com.unisonht.utils.UnisonhtLoggerFactory;

import java.io.File;
import java.io.IOException;
import java.util.Map;

public class ImageViewerDevice extends Device {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(ImageViewerDevice.class);
    private final Map<String, String> images;
    private final Configuration configuration;
    private Process imageViewerProcess;

    public ImageViewerDevice(Configuration configuration, Map<String, String> images) {
        this.configuration = configuration;
        this.images = images;
    }

    @Override
    public void ensureOff() {
        if (imageViewerProcess != null) {
            imageViewerProcess.destroy();
        }
    }

    @Override
    public void ensureOn() {

    }

    @Override
    public void buttonPress(String buttonName) {
        String imageFileName = this.images.get(buttonName);
        if (imageFileName == null) {
            throw new UnisonhtException("Could not find image in image map for button: " + buttonName);
        }
        displayImage(imageFileName);
    }

    @Override
    public Status getStatus() {
        return new StatusUnknown();
    }

    private void displayImage(String imageFileName) {
        File imageFile = this.configuration.resolveFileName(imageFileName);
        LOGGER.debug("displaying image: %s", imageFile.getAbsolutePath());
        try {
            run(new String[]{"pqiv", "-fit", imageFile.getAbsolutePath()});
            bringWindowToTopAsync("pqiv");
        } catch (IOException ex) {
            throw new UnisonhtException("Could not view image: " + imageFile.getAbsolutePath(), ex);
        }
    }

    private void bringWindowToTopAsync(final String windowString) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    for (int i = 0; i < 100; i++) {
                        Runtime.getRuntime().exec(new String[]{"wmctrl", "-R", windowString});
                        ThreadUtil.sleep(100);
                    }
                } catch (IOException ex) {
                    LOGGER.error("Could not bring window to the top", ex);
                }
            }
        }).start();
    }

    private void run(String[] args) throws IOException {
        File dir = new File(".");
        imageViewerProcess = Runtime.getRuntime().exec(args, new String[]{"DISPLAY=:0.0"}, dir);
    }
}
