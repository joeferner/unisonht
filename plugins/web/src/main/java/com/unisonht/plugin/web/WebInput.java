package com.unisonht.plugin.web;

import com.unisonht.plugin.Input;
import com.unisonht.utils.UnisonhtException;
import com.unisonht.utils.UnisonhtLogger;
import com.unisonht.utils.UnisonhtLoggerFactory;
import org.eclipse.jetty.server.*;
import org.eclipse.jetty.server.handler.ContextHandlerCollection;
import org.eclipse.jetty.webapp.WebAppContext;

import java.io.File;

import static com.google.common.base.Preconditions.checkNotNull;

public class WebInput extends Input {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(WebInput.class);
    private Server server;

    public WebInput(Integer port, String webAppDir) {
        checkNotNull(webAppDir, "webAppDir is required");
        port = port == null ? 8080 : port;

        String contextPath = "/";
        server = new Server();

        HttpConfiguration httpConfig = new HttpConfiguration();

        ServerConnector httpConnector = new ServerConnector(server, new HttpConnectionFactory(httpConfig));
        httpConnector.setPort(port);

        WebAppContext webAppContext = new WebAppContext();
        webAppContext.setContextPath(contextPath);
        webAppContext.setWar(new File(webAppDir).getAbsolutePath());

        ContextHandlerCollection contexts = new ContextHandlerCollection();
        contexts.setHandlers(new Handler[]{webAppContext});

        server.setConnectors(new Connector[]{httpConnector});
        server.setHandler(contexts);

        try {
            server.start();
        } catch (Exception e) {
            throw new UnisonhtException("Could not start jetty", e);
        }

        LOGGER.info("Listening http://localhost:%d", port);
    }
}
