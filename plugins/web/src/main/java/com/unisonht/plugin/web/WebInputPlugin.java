package com.unisonht.plugin.web;

import com.unisonht.plugin.Input;
import com.unisonht.plugin.InputPlugin;

import java.util.Map;

public class WebInputPlugin extends InputPlugin {
    @Override
    public Input createInput(Map<String, Object> data) {
        Integer port = (Integer) data.get("port");
        String webAppDir = (String) data.get("webAppDir");
        return new WebInput(port, webAppDir);
    }
}
