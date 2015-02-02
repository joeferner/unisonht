package com.unisonht.utils;

import com.google.inject.Guice;
import com.google.inject.Injector;
import com.google.inject.Module;
import com.unisonht.config.Configuration;

public class InjectHelper {
    private static Injector injector;

    public static <T> T inject(T o, ModuleMaker moduleMaker) {
        ensureInjectorCreated(moduleMaker);
        inject(o);
        return o;
    }

    public static <T> T inject(T o) {
        if (injector == null) {
            throw new UnisonhtException("Could not find injector");
        }
        injector.injectMembers(o);
        return o;
    }

    public static Injector getInjector() {
        return injector;
    }

    public static <T> T getInstance(Class<T> clazz, ModuleMaker moduleMaker) {
        ensureInjectorCreated(moduleMaker);
        return injector.getInstance(clazz);
    }

    public static <T> T getInstance(Class<? extends T> clazz) {
        if (injector == null) {
            throw new UnisonhtException("Could not find injector");
        }
        return injector.getInstance(clazz);
    }

    public static void shutdown() {
        injector = null;
    }

    public static boolean hasInjector() {
        return injector != null;
    }

    public static interface ModuleMaker {
        Module createModule();

        Configuration getConfiguration();
    }

    private static void ensureInjectorCreated(ModuleMaker moduleMaker) {
        if (injector == null) {
            injector = Guice.createInjector(moduleMaker.createModule());
        }
    }
}
