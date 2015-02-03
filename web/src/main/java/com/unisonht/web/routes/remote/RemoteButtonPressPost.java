package com.unisonht.web.routes.remote;

import com.google.inject.Inject;
import com.unisonht.config.Configuration;
import com.unisonht.services.RemoteService;
import com.unisonht.utils.UnisonhtLogger;
import com.unisonht.utils.UnisonhtLoggerFactory;
import com.unisonht.web.routes.BaseRequestHandler;
import io.lumify.miniweb.HandlerChain;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class RemoteButtonPressPost extends BaseRequestHandler {
    private final RemoteService remoteService;

    @Inject
    public RemoteButtonPressPost(
            Configuration configuration,
            RemoteService remoteService
    ) {
        super(configuration);
        this.remoteService = remoteService;
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, HandlerChain chain) throws Exception {
        String remoteName = getAttributeString(request, "remoteName");
        String buttonName = getAttributeString(request, "buttonName");

        remoteService.buttonPress(remoteName, buttonName);

        respondWithSuccessJson(response);
    }
}
