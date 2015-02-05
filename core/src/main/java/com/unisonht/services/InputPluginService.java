package com.unisonht.services;

import com.google.inject.Inject;
import com.unisonht.clientapi.ConfigJson;
import com.unisonht.config.Configuration;
import com.unisonht.plugin.Input;
import com.unisonht.plugin.InputEventListener;
import com.unisonht.plugin.InputPlugin;
import com.unisonht.utils.*;

import java.util.HashMap;
import java.util.Map;

public class InputPluginService implements InputEventListener {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(InputPluginService.class);
    private final Configuration configuration;
    private final RemoteService remoteService;
    private Map<String, Input> inputs;

    @Inject
    public InputPluginService(
            Configuration configuration,
            RemoteService remoteService
    ) {
        this.configuration = configuration;
        this.remoteService = remoteService;
    }

    public void loadInputPlugins() {
        Map<String, Input> inputs = new HashMap<>();
        for (Map.Entry<String, ConfigJson.InputPlugin> inputPluginEntry : configuration.getConfigJson().getInputPlugins().entrySet()) {
            String inputPluginName = inputPluginEntry.getKey();
            LOGGER.debug("creating input: %s (%s)", inputPluginName, inputPluginEntry.getValue().getPluginClass());
            Input inputInstance;
            try {
                inputInstance = createInputInstance(inputPluginEntry.getValue());
            } catch (Throwable ex) {
                throw new UnisonhtException("Could not create input " + inputPluginName + " using " + inputPluginEntry.getValue().getPluginClass(), ex);
            }
            inputs.put(inputPluginName, inputInstance);
        }
        this.inputs = inputs;
    }

    private Input createInputInstance(ConfigJson.InputPlugin inputConfiguration) {
        Class<? extends InputPlugin> inputPluginClass = ClassUtil.forName(inputConfiguration.getPluginClass(), InputPlugin.class);
        InputPlugin inputPlugin = InjectHelper.getInstance(inputPluginClass);
        Input input = inputPlugin.createInput(inputConfiguration.getData());
        input.addEventListener(this);
        return input;
    }

    @Override
    public void onButtonPress(String remoteControlName, String buttonName, int repeatCount) {
        this.remoteService.buttonPress(remoteControlName, buttonName);
    }
}
