package com.unisonht.plugin.projector.epsonNetworkRS232;

import com.unisonht.plugin.Device;
import com.unisonht.plugin.DevicePlugin;
import com.unisonht.utils.UnisonhtException;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Map;

public class EpsonNetworkRS232ProjectorDevicePlugin extends DevicePlugin {
    @Override
    public Device createDevice(Map<String, Object> configuration) {
        String addressString = (String) configuration.get("address");
        InetAddress address = null;
        try {
            address = InetAddress.getByName(addressString);
        } catch (UnknownHostException e) {
            throw new UnisonhtException("Could not resolve: " + addressString, e);
        }
        Map<String, String> inputs = (Map<String, String>) configuration.get("inputs");
        return new EpsonNetworkRS232ProjectorDevice(address, inputs);
    }
}
