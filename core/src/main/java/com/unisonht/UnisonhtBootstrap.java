package com.unisonht;

import com.google.inject.AbstractModule;
import com.google.inject.Module;
import com.unisonht.config.Configuration;
import com.unisonht.utils.InjectHelper;
import com.unisonht.utils.UnisonhtLogger;
import com.unisonht.utils.UnisonhtLoggerFactory;

public class UnisonhtBootstrap extends AbstractModule {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(UnisonhtBootstrap.class);
    private static UnisonhtBootstrap bootstrap;
    private final Configuration config;

    public UnisonhtBootstrap(Configuration config) {
        this.config = config;
    }

    public static InjectHelper.ModuleMaker bootstrapModuleMaker(final Configuration config) {
        return new InjectHelper.ModuleMaker() {

            @Override
            public Module createModule() {
                return UnisonhtBootstrap.bootstrap(config);
            }

            @Override
            public Configuration getConfiguration() {
                return config;
            }
        };
    }

    private static Module bootstrap(Configuration config) {
        if (bootstrap == null) {
            LOGGER.debug("Initializing UnisonhtBootstrap with Configuration:\n%s", config);
            bootstrap = new UnisonhtBootstrap(config);
        }
        return bootstrap;
    }

    @Override
    protected void configure() {
        bind(Configuration.class).toInstance(config);
    }
}
