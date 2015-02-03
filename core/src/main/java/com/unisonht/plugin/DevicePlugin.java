package com.unisonht.plugin;

import java.util.Map;

public abstract class DevicePlugin {
    public abstract Device createDevice(Map<String, Object> configuration);
}
