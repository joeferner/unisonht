package com.unisonht.web;

import com.google.inject.Injector;
import com.unisonht.utils.InjectHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.ServletRegistration;

public class WebApplicationBootstrap implements ServletContextListener {
    private static final Logger LOGGER = LoggerFactory.getLogger(WebApplicationBootstrap.class);
    public static final String UNISONHT_SERVLET_NAME = "unisonht";

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        LOGGER.info("BEGIN: contextInitialized");
        final ServletContext context = sce.getServletContext();
        if (context != null) {
            // Store the injector in the context for a servlet to access later
            context.setAttribute(Injector.class.getName(), InjectHelper.getInjector());

            setupWebApp(context);
        } else {
            throw new RuntimeException("Failed to initialize context. UnisonHT is not running.");
        }
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        LOGGER.info("END: Servlet context destroyed...");
    }


    private void setupWebApp(ServletContext context) {
        Router router = new Router(context);
        ServletRegistration.Dynamic servlet = context.addServlet(UNISONHT_SERVLET_NAME, router);
        servlet.addMapping("/*");
        servlet.setAsyncSupported(true);
    }
}
