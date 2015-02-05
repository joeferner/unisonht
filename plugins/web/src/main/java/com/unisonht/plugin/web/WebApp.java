package com.unisonht.plugin.web;

import com.google.inject.Injector;
import io.lumify.miniweb.App;
import io.lumify.miniweb.Handler;

import javax.servlet.ServletContext;

public class WebApp extends App {
    private final Injector injector;

    public WebApp(ServletContext servletContext, Injector injector) {
        super(servletContext);
        this.injector = injector;
    }

    @Override
    protected Handler[] instantiateHandlers(Class<? extends Handler>[] handlerClasses) throws Exception {
        Handler[] handlers = new Handler[handlerClasses.length];
        for (int i = 0; i < handlerClasses.length; i++) {
            handlers[i] = injector.getInstance(handlerClasses[i]);
        }
        return handlers;
    }
}
