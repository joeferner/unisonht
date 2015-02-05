package com.unisonht.plugin.lirc;

import com.unisonht.plugin.Input;
import com.unisonht.plugin.InputPlugin;

import java.util.Map;

public class LircInputPlugin extends InputPlugin {
    private static final String DEFAULT_PATH = "/var/run/lirc/lircd";

    @Override
    public Input createInput(Map<String, Object> data) {
        String path = (String) data.get("path");
        if (path == null) {
            path = DEFAULT_PATH;
        }
        return new LircInput(path);
    }
}
