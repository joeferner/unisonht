package com.unisonht;

import com.unisonht.config.Configuration;
import com.unisonht.config.ConfigurationLoader;
import com.unisonht.services.DeviceService;
import com.unisonht.services.InputPluginService;
import com.unisonht.utils.InjectHelper;
import com.unisonht.utils.UnisonhtLogger;
import com.unisonht.utils.UnisonhtLoggerFactory;

import java.util.HashMap;

public class UnisonHT {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(UnisonHT.class);

    public static void main(String[] args) {
        new UnisonHT().run(args);
    }

    private void run(String[] args) {
        LOGGER.info("BEGIN: contextInitialized");
        Configuration configuration = ConfigurationLoader.load(new HashMap());
        setupInjector(configuration);
        setupDevices();
        setupInputPlugins();
    }

    private void setupInjector(Configuration config) {
        InjectHelper.inject(this, UnisonhtBootstrap.bootstrapModuleMaker(config));
    }

    private void setupDevices() {
        InjectHelper.getInstance(DeviceService.class).loadDeviceInstances();
    }

    private void setupInputPlugins() {
        InjectHelper.getInstance(InputPluginService.class).loadInputPlugins();
    }
}
