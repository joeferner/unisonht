package com.unisonht.services;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.unisonht.clientapi.ConfigJson;
import com.unisonht.config.Configuration;
import com.unisonht.plugin.Device;
import com.unisonht.plugin.DevicePlugin;
import com.unisonht.plugin.status.Status;
import com.unisonht.plugin.status.StatusError;
import com.unisonht.utils.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.FutureTask;

import static com.google.common.base.Preconditions.checkNotNull;

@Singleton
public class DeviceService {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(DeviceService.class);
    private final Configuration configuration;
    private Map<String, Device> devices;
    private final ExecutorService executor;

    @Inject
    public DeviceService(Configuration configuration) {
        this.configuration = configuration;
        executor = Executors.newFixedThreadPool(5);
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

    public Map<String, Status> getAllDevicesStatus() {
        List<FutureTask<StatusResult>> taskList = new ArrayList<>();
        for (Map.Entry<String, Device> deviceEntry : devices.entrySet()) {
            FutureTask<StatusResult> task = new FutureTask<>(new GetDeviceStatusTask(deviceEntry));
            executor.execute(task);
            taskList.add(task);
        }

        Map<String, Status> results = new HashMap<>();
        for (FutureTask<StatusResult> task : taskList) {
            try {
                StatusResult statusResult = task.get();
                results.put(statusResult.getDeviceEntry().getKey(), statusResult.getStatus());
            } catch (Exception e) {
                LOGGER.error("Failed to get results from task: " + task, e);
            }
        }

        return results;
    }

    private static class StatusResult {
        private final Map.Entry<String, Device> deviceEntry;
        private final Status status;

        public StatusResult(Map.Entry<String, Device> deviceEntry, Status status) {
            this.deviceEntry = deviceEntry;
            this.status = status;
        }

        public Map.Entry<String, Device> getDeviceEntry() {
            return deviceEntry;
        }

        public Status getStatus() {
            return status;
        }
    }

    private static class GetDeviceStatusTask implements Callable<StatusResult> {
        private final Map.Entry<String, Device> deviceEntry;

        public GetDeviceStatusTask(Map.Entry<String, Device> deviceEntry) {
            this.deviceEntry = deviceEntry;
        }

        @Override
        public StatusResult call() throws Exception {
            LOGGER.debug("Getting status from %s (%s)", this.deviceEntry.getKey(), this.deviceEntry.getValue().getClass().getName());
            try {
                Status status = this.deviceEntry.getValue().getStatus();
                return new StatusResult(this.deviceEntry, status);
            } catch (Throwable ex) {
                LOGGER.error("Could not get status of device: %s (%s)", deviceEntry.getKey(), deviceEntry.getValue().getClass().getName(), ex);
                return new StatusResult(this.deviceEntry, new StatusError(ex));
            }
        }
    }
}
