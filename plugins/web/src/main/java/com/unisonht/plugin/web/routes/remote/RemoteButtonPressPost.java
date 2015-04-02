package com.unisonht.plugin.web.routes.remote;

import com.google.inject.Inject;
import com.unisonht.config.Configuration;
import com.unisonht.plugin.web.routes.BaseRequestHandler;
import com.unisonht.services.RemoteService;
import org.neolumin.webster.HandlerChain;

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
