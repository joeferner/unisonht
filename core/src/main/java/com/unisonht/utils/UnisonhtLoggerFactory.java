package com.unisonht.utils;

import com.unisonht.config.ConfigurationLoader;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

public class UnisonhtLoggerFactory {
    private static final Map<String, UnisonhtLogger> logMap = new HashMap<>();
    private static boolean initialized = false;
    private static boolean initializing = false;

    public static UnisonhtLogger getLogger(Class clazz) {
        ensureInitialized();
        return getLogger(clazz.getName());
    }

    private static void ensureInitialized() {
        synchronized (logMap) {
            if (!initialized && !initializing) {
                initializing = true;
                ConfigurationLoader.configureLog4j();
                initialized = true;
                initializing = false;
            }
        }
    }

    public static UnisonhtLogger getLogger(String name) {
        ensureInitialized();
        synchronized (logMap) {
            UnisonhtLogger lumifyLogger = logMap.get(name);
            if (lumifyLogger != null) {
                return lumifyLogger;
            }
            lumifyLogger = new UnisonhtLogger(LoggerFactory.getLogger(name));
            logMap.put(name, lumifyLogger);
            return lumifyLogger;
        }
    }
}
