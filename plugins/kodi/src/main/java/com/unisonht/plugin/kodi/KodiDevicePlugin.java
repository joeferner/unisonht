package com.unisonht.plugin.kodi;

import com.unisonht.plugin.Device;
import com.unisonht.plugin.DevicePlugin;

import java.util.Map;

public class KodiDevicePlugin extends DevicePlugin {
    @Override
    public Device createDevice(Map<String, Object> configuration) {
        String address = (String) configuration.get("address");
        return new KodiDevice(address);
    }
}
