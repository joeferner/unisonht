package com.unisonht.plugin.xbox;

import com.unisonht.plugin.Device;
import com.unisonht.plugin.DevicePlugin;

import java.util.Map;

public class XBoxDevicePlugin extends DevicePlugin {
    @Override
    public Device createDevice(Map<String, Object> configuration) {
        return new XBoxDevice();
    }
}
