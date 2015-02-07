package com.unisonht.services;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.unisonht.clientapi.ConfigJson;
import com.unisonht.config.Configuration;
import com.unisonht.utils.UnisonhtException;
import com.unisonht.utils.UnisonhtLogger;
import com.unisonht.utils.UnisonhtLoggerFactory;

import java.util.Map;

@Singleton
public class ModeService {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(ModeService.class);
    public static final String GLOBAL_MODE_NAME = "global";
    private final Configuration configuration;
    private final ActionService actionService;
    private final DeviceService deviceService;
    private String currentModeName;

    @Inject
    public ModeService(
            Configuration configuration,
            ActionService actionService,
            DeviceService deviceService
    ) {
        this.configuration = configuration;
        this.actionService = actionService;
        this.deviceService = deviceService;
        this.currentModeName = this.configuration.getConfigJson().getDefaultMode();
    }

    public ConfigJson.Mode getCurrentMode() {
        if (getCurrentModeName() != null) {
            return configuration.getConfigJson().getModes().get(getCurrentModeName());
        }
        return null;
    }

    public void switchMode(String modeName) {
        ConfigJson.Mode currentMode = getCurrentMode();
        if (currentMode != null) {
            ConfigJson.Action onExitAction = currentMode.getOnExit();
            if (onExitAction != null) {
                LOGGER.debug("Running onExit for: %s", this.currentModeName);
                actionService.runAction(onExitAction);
            }
        }
        this.currentModeName = null;

        ConfigJson configJson = configuration.getConfigJson();
        ConfigJson.Mode mode = configJson.getModes().get(modeName);
        if (mode == null) {
            throw new UnisonhtException("Could not find mode: " + modeName);
        }
        if (mode.getOnEnter() != null) {
            LOGGER.debug("Running onEnter for: %s", modeName);
            actionService.runAction(mode.getOnEnter());
        }
        this.currentModeName = modeName;
        LOGGER.info("mode is now: %s", this.currentModeName);
    }

    public void buttonPress(String remoteName, String buttonName) {
        ConfigJson configJson = configuration.getConfigJson();

        ConfigJson.Mode globalMode = configJson.getModes().get(ModeService.GLOBAL_MODE_NAME);
        if (globalMode != null && buttonPress(globalMode, remoteName, buttonName)) {
            return;
        }

        ConfigJson.Mode currentMode = getCurrentMode();
        if (currentMode != null && buttonPress(currentMode, remoteName, buttonName)) {
            return;
        }

        if (currentMode != null) {
            String defaultDevice = currentMode.getDefaultDevice();
            if (defaultDevice != null) {
                deviceService.buttonPress(defaultDevice, buttonName);
                return;
            }
        }

        throw new UnisonhtException("Not a valid button " + remoteName + ":" + buttonName + " for mode " + getCurrentModeName());
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

    public String getCurrentModeName() {
        return currentModeName;
    }
}
