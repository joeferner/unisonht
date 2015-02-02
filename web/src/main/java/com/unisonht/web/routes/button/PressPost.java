package com.unisonht.web.routes.button;

import com.google.inject.Inject;
import com.unisonht.config.Configuration;
import com.unisonht.web.routes.BaseRequestHandler;
import io.lumify.miniweb.HandlerChain;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class PressPost extends BaseRequestHandler {
    @Inject
    public PressPost(Configuration configuration) {
        super(configuration);
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, HandlerChain chain) throws Exception {
        respondWithSuccessJson(response);
    }
}
