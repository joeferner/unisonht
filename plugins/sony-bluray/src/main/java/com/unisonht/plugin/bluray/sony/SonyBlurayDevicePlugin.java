package com.unisonht.plugin.bluray.sony;

import com.google.inject.Inject;
import com.unisonht.plugin.Device;
import com.unisonht.plugin.DevicePlugin;
import com.unisonht.services.RemoteService;

import java.util.Map;

public class SonyBlurayDevicePlugin extends DevicePlugin {
    private final RemoteService remoteService;

    @Inject
    public SonyBlurayDevicePlugin(RemoteService remoteService) {
        this.remoteService = remoteService;
    }

    @Override
    public Device createDevice(Map<String, Object> configuration) {
        String address = (String) configuration.get("address");
        String macAddress = (String) configuration.get("mac");
        return new SonyBlurayDevice(remoteService, address, macAddress);
    }
}
