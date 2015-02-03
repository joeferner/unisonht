package com.unisonht.services;

import com.google.inject.Inject;
import com.unisonht.clientapi.ConfigJson;
import com.unisonht.config.Configuration;
import com.unisonht.utils.UnisonhtException;

import java.util.Map;

public class ModeService {
    public static final String DEFAULT_MODE_NAME = "_";
    private final Configuration configuration;
    private final ActionService actionService;
    private final StateService stateService;

    @Inject
    public ModeService(
            Configuration configuration,
            ActionService actionService,
            StateService stateService
    ) {
        this.configuration = configuration;
        this.actionService = actionService;
        this.stateService = stateService;
    }

    public ConfigJson.Mode getCurrentMode() {
        if (stateService.getCurrentModeName() != null) {
            return configuration.getConfigJson().getModes().get(stateService.getCurrentModeName());
        }
        return null;
    }

    public void switchMode(String modeName) {
        ConfigJson configJson = configuration.getConfigJson();
        ConfigJson.Mode mode = configJson.getModes().get(modeName);
        if (mode == null) {
            throw new UnisonhtException("Could not find mode: " + modeName);
        }
        if (mode.getOnEnter() != null) {
            actionService.runAction(mode.getOnEnter());
        }
        this.stateService.setCurrentModeName(modeName);
    }

    public void buttonPress(String remoteName, String buttonName) {
        ConfigJson configJson = configuration.getConfigJson();

        ConfigJson.Mode defaultMode = configJson.getModes().get(ModeService.DEFAULT_MODE_NAME);
        if (defaultMode != null && buttonPress(defaultMode, remoteName, buttonName)) {
            return;
        }

        ConfigJson.Mode currentMode = getCurrentMode();
        if (currentMode != null && buttonPress(currentMode, remoteName, buttonName)) {
            return;
        }

        throw new UnisonhtException("Not a valid button " + remoteName + ":" + buttonName + " for mode " + stateService.getCurrentModeName());
    }

    private boolean buttonPress(ConfigJson.Mode mode, String remoteName, String buttonName) {
        for (Map.Entry<String, ConfigJson.Action> buttonEntry : mode.getButtonMap().entrySet()) {
            if (isMatch(buttonEntry.getKey(), remoteName, buttonName)) {
                this.actionService.runAction(buttonEntry.getValue());
                return true;
            }
        }
        return false;
    }

    private boolean isMatch(String buttonKey, String remoteName, String buttonName) {
        if (buttonKey.equals(remoteName + ":" + buttonName)) {
            return true;
        }
        if (buttonKey.equals(buttonName)) {
            return true;
        }
        return false;
    }
}
