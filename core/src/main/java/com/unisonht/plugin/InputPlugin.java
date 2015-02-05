package com.unisonht.plugin;

import java.util.Map;

public abstract class InputPlugin {
    public abstract Input createInput(Map<String, Object> data);
}
