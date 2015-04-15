package com.unisonht.plugin.web;

import com.google.inject.Injector;
import com.unisonht.plugin.web.routes.config.ConfigGet;
import com.unisonht.plugin.web.routes.config.ConfigGetRemoteImage;
import com.unisonht.plugin.web.routes.remote.RemoteButtonPressPost;
import com.unisonht.plugin.web.routes.status.StatusGet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.*;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class Router extends HttpServlet {
    private static final Logger LOGGER = LoggerFactory.getLogger(Router.class);
    private final WebApp app;

    /**
     * Copied from org.eclipse.jetty.server.Request.__MULTIPART_CONFIG_ELEMENT.
     * TODO: Examine why this is necessary and how it can be abstracted to any servlet container.
     */
    private static final String JETTY_MULTIPART_CONFIG_ELEMENT8 = "org.eclipse.multipartConfig";
    private static final String JETTY_MULTIPART_CONFIG_ELEMENT9 = "org.eclipse.jetty.multipartConfig";
    private static final MultipartConfigElement MULTI_PART_CONFIG = new MultipartConfigElement(System.getProperty("java.io.tmpdir"));

    public Router(ServletContext servletContext) {
        final Injector injector = (Injector) servletContext.getAttribute(Injector.class.getName());

        app = new WebApp(servletContext, injector);

        app.get("/config", ConfigGet.class);
        app.get("/config/remote/{remoteName}/image", ConfigGetRemoteImage.class);

        app.get("/status", StatusGet.class);

        app.post("/remote/{remoteName}/{buttonName}/press", RemoteButtonPressPost.class);
    }

    @Override
    public void service(ServletRequest req, ServletResponse resp) throws ServletException, IOException {
        try {
            if (req.getContentType() != null && req.getContentType().startsWith("multipart/form-data")) {
                req.setAttribute(JETTY_MULTIPART_CONFIG_ELEMENT8, MULTI_PART_CONFIG);
                req.setAttribute(JETTY_MULTIPART_CONFIG_ELEMENT9, MULTI_PART_CONFIG);
            }

            HttpServletResponse httpResponse = (HttpServletResponse) resp;
            httpResponse.addHeader("Accept-Ranges", "bytes");
            app.handle((HttpServletRequest) req, httpResponse);
        } catch (Exception e) {
            throw new ServletException(e);
        }
    }
}
