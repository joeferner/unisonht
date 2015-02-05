package com.unisonht.plugin.imageViewer;

import com.unisonht.plugin.Device;
import com.unisonht.utils.ThreadUtil;
import com.unisonht.utils.UnisonhtException;
import com.unisonht.utils.UnisonhtLogger;
import com.unisonht.utils.UnisonhtLoggerFactory;

import java.io.IOException;
import java.util.Map;

public class ImageViewerDevice extends Device {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(ImageViewerDevice.class);
    private final Map<String, String> images;
    private Process imageViewerProcess;

    public ImageViewerDevice(Map<String, String> images) {
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

    private void displayImage(String imageFileName) {
        LOGGER.debug("displaying image: %s", imageFileName);
        try {
            run(new String[]{"pqiv", "-fit", imageFileName});
            bringWindowToTopAsync("pqiv");
        } catch (IOException ex) {
            throw new UnisonhtException("Could not view image: " + imageFileName, ex);
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
        imageViewerProcess = Runtime.getRuntime().exec(args);
    }
}
