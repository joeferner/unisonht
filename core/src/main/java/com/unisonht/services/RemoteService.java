package com.unisonht.services;

import com.google.inject.Inject;
import com.unisonht.clientapi.ConfigJson;
import com.unisonht.config.Configuration;
import com.unisonht.utils.UnisonhtLogger;
import com.unisonht.utils.UnisonhtLoggerFactory;

import static com.google.common.base.Preconditions.checkNotNull;

public class RemoteService {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(RemoteService.class);
    private final Configuration configuration;
    private final ModeService modeService;

    @Inject
    public RemoteService(
            Configuration configuration,
            ModeService modeService
    ) {
        this.configuration = configuration;
        this.modeService = modeService;
    }

    public void buttonPress(String remoteName, String buttonName) {
        LOGGER.debug("button press: %s %s", remoteName, buttonName);

        ConfigJson configJson = this.configuration.getConfigJson();

        ConfigJson.Remote remote = configJson.getRemotes().get(remoteName);
        checkNotNull(remote, "Could not find remote with name: " + remoteName);

        ConfigJson.Remote.Button button = remote.getButtonMap().get(buttonName);
        checkNotNull(button, "Could not find button with name: " + buttonName + " on remote: " + remoteName);

        modeService.buttonPress(remoteName, buttonName);
    }
}
