package com.unisonht.services;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.unisonht.clientapi.ConfigJson;
import com.unisonht.config.Configuration;
import com.unisonht.plugin.Device;
import com.unisonht.plugin.DevicePlugin;
import com.unisonht.utils.*;

import java.util.HashMap;
import java.util.Map;

import static com.google.common.base.Preconditions.checkNotNull;

@Singleton
public class DeviceService {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(DeviceService.class);
    private final Configuration configuration;
    private Map<String, Device> devices;

    @Inject
    public DeviceService(Configuration configuration) {
        this.configuration = configuration;
    }

    public void ensureOff(String deviceName) {
        getDeviceInstance(deviceName).ensureOff();
    }

    public void ensureOn(String deviceName) {
        getDeviceInstance(deviceName).ensureOn();
    }

    public void buttonPress(String deviceName, String buttonName) {
        getDeviceInstance(deviceName).buttonPress(buttonName);
    }

    public void changeInput(String deviceName, String input) {
        getDeviceInstance(deviceName).changeInput(input);
    }

    private Device getDeviceInstance(String deviceName) {
        if (devices == null) {
            loadDeviceInstances();
        }
        Device device = devices.get(deviceName);
        checkNotNull(device, "Could not find device instance: " + deviceName);
        return device;
    }

    public synchronized void loadDeviceInstances() {
        Map<String, Device> devices = new HashMap<>();
        for (Map.Entry<String, ConfigJson.Device> deviceEntry : configuration.getConfigJson().getDevices().entrySet()) {
            String deviceName = deviceEntry.getKey();
            String deviceClass = deviceEntry.getValue().getDeviceClass();
            checkNotNull(deviceClass, "deviceClass is required for a device");
            LOGGER.debug("creating device: %s (%s)", deviceName, deviceClass);
            Device deviceInstance;
            try {
                deviceInstance = createDeviceInstance(deviceEntry.getValue());
            } catch (Throwable ex) {
                throw new UnisonhtException("Could not create device " + deviceName + " using " + deviceClass, ex);
            }
            devices.put(deviceName, deviceInstance);
        }
        this.devices = devices;
    }

    private Device createDeviceInstance(ConfigJson.Device deviceConfiguration) {
        Class<? extends DevicePlugin> devicePluginClass = ClassUtil.forName(deviceConfiguration.getDeviceClass(), DevicePlugin.class);
        DevicePlugin devicePlugin = InjectHelper.getInstance(devicePluginClass);
        return devicePlugin.createDevice(deviceConfiguration.getData());
    }
}
