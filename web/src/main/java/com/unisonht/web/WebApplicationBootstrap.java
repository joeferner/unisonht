package com.unisonht.web;

import com.google.inject.Injector;
import com.unisonht.UnisonhtBootstrap;
import com.unisonht.config.Configuration;
import com.unisonht.config.ConfigurationLoader;
import com.unisonht.services.DeviceService;
import com.unisonht.services.InputPluginService;
import com.unisonht.utils.InjectHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.ServletRegistration;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

public class WebApplicationBootstrap implements ServletContextListener {
    private static final Logger LOGGER = LoggerFactory.getLogger(WebApplicationBootstrap.class);
    public static final String UNISONHT_SERVLET_NAME = "unisonht";
    public static final String APP_CONFIG_LOADER = "application.config.loader";

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        LOGGER.info("BEGIN: contextInitialized");
        final ServletContext context = sce.getServletContext();
        if (context != null) {
            Configuration configuration = ConfigurationLoader.load(context.getInitParameter(APP_CONFIG_LOADER), getInitParametersAsMap(context));
            setupInjector(context, configuration);
            setupDevices();
            setupInputPlugins();
            setupWebApp(context);
        } else {
            throw new RuntimeException("Failed to initialize context. UnisonHT is not running.");
        }
    }

    private Map<String, String> getInitParametersAsMap(ServletContext context) {
        Map<String, String> initParameters = new HashMap<>();
        Enumeration<String> e = context.getInitParameterNames();
        while (e.hasMoreElements()) {
            String initParameterName = e.nextElement();
            initParameters.put(initParameterName, context.getInitParameter(initParameterName));
        }
        return initParameters;
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        LOGGER.info("END: Servlet context destroyed...");
    }

    private void setupInjector(ServletContext context, Configuration config) {
        InjectHelper.inject(this, UnisonhtBootstrap.bootstrapModuleMaker(config));

        // Store the injector in the context for a servlet to access later
        context.setAttribute(Injector.class.getName(), InjectHelper.getInjector());
    }

    private void setupDevices() {
        InjectHelper.getInstance(DeviceService.class).loadDeviceInstances();
    }

    private void setupInputPlugins() {
        InjectHelper.getInstance(InputPluginService.class).loadInputPlugins();
    }

    private void setupWebApp(ServletContext context) {
        Router router = new Router(context);
        ServletRegistration.Dynamic servlet = context.addServlet(UNISONHT_SERVLET_NAME, router);
        servlet.addMapping("/*");
        servlet.setAsyncSupported(true);
    }
}
