package com.unisonht.plugin.projector.benq;

import com.unisonht.plugin.Device;
import com.unisonht.plugin.DevicePlugin;

import java.util.Map;

public class BenqProjectorDevicePlugin extends DevicePlugin {
    @Override
    public Device createDevice(Map<String, Object> configuration) {
        String address = (String) configuration.get("address");
        Map<String, String> inputs = (Map<String, String>) configuration.get("inputs");
        return new BenqProjectorDevice(address, inputs);
    }
}
