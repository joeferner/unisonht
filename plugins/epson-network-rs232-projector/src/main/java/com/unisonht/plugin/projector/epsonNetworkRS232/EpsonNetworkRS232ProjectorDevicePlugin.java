package com.unisonht.plugin.projector.epsonNetworkRS232;

import com.unisonht.plugin.Device;
import com.unisonht.plugin.DevicePlugin;

import java.util.Map;

public class EpsonNetworkRS232ProjectorDevicePlugin extends DevicePlugin {
    @Override
    public Device createDevice(Map<String, Object> configuration) {
        String address = (String) configuration.get("address");
        Map<String, String> inputs = (Map<String, String>) configuration.get("inputs");
        return new EpsonNetworkRS232ProjectorDevice(address, inputs);
    }
}
