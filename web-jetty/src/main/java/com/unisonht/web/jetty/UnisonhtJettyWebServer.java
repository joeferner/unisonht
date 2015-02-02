package com.unisonht.web.jetty;

import com.beust.jcommander.JCommander;
import com.beust.jcommander.Parameter;
import com.unisonht.UnisonhtBootstrap;
import com.unisonht.config.Configuration;
import com.unisonht.config.ConfigurationLoader;
import com.unisonht.utils.InjectHelper;
import com.unisonht.utils.UnisonhtLogger;
import com.unisonht.utils.UnisonhtLoggerFactory;
import org.eclipse.jetty.server.*;
import org.eclipse.jetty.server.handler.ContextHandlerCollection;
import org.eclipse.jetty.webapp.WebAppContext;

public class UnisonhtJettyWebServer {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(UnisonhtJettyWebServer.class);
    private Server server;
    private Configuration configuration;

    @Parameter(names = {"-httpPort"}, description = "HTTP Port")
    private int httpPort = 8080;

    @Parameter(names = {"-contextPath"}, description = "Context path")
    private String contextPath = "/";

    @Parameter(names = {"-webAppDir"}, description = "webapp dir")
    private String webAppDir;

    public static void main(String[] args) throws Exception {
        int res = new UnisonhtJettyWebServer().run(args);
        if (res != 0) {
            System.exit(res);
        }
    }

    protected int run(String[] args) throws Exception {
        new JCommander(this, args);

        InjectHelper.inject(this, UnisonhtBootstrap.bootstrapModuleMaker(getConfiguration()));

        server = new Server();

        HttpConfiguration httpConfig = new HttpConfiguration();

        ServerConnector httpConnector = new ServerConnector(server, new HttpConnectionFactory(httpConfig));
        httpConnector.setPort(httpPort);

        WebAppContext webAppContext = new WebAppContext();
        webAppContext.setContextPath(contextPath);
        webAppContext.setWar(webAppDir);

        ContextHandlerCollection contexts = new ContextHandlerCollection();
        contexts.setHandlers(new Handler[]{webAppContext});

        server.setConnectors(new Connector[]{httpConnector});
        server.setHandler(contexts);

        server.start();

        LOGGER.info("Listening http://localhost:%d", httpPort);
        server.join();

        return 0;
    }

    private Configuration getConfiguration() {
        if (configuration == null) {
            configuration = ConfigurationLoader.load();
        }
        return configuration;
    }

    protected Server getServer() {
        return server;
    }
}

