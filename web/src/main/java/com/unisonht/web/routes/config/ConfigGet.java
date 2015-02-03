package com.unisonht.web.routes.config;

import com.google.inject.Inject;
import com.unisonht.clientapi.ConfigJson;
import com.unisonht.config.Configuration;
import com.unisonht.web.routes.BaseRequestHandler;
import io.lumify.miniweb.HandlerChain;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class ConfigGet extends BaseRequestHandler {
    @Inject
    public ConfigGet(Configuration configuration) {
        super(configuration);
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, HandlerChain chain) throws Exception {
        ConfigJson configJson = getConfiguration().getConfigJson();
        respondWithClientApiObject(response, configJson);
    }
}

