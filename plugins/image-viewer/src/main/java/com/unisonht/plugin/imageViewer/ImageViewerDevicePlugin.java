package com.unisonht.plugin.imageViewer;

import com.unisonht.plugin.Device;
import com.unisonht.plugin.DevicePlugin;

import java.util.Map;

public class ImageViewerDevicePlugin extends DevicePlugin {
    @Override
    public Device createDevice(Map<String, Object> configuration) {
        Map<String, String> images = (Map<String, String>) configuration.get("images");
        return new ImageViewerDevice(images);
    }
}
