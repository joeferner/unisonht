package com.unisonht.plugin.web.routes.status;

import com.google.inject.Inject;
import com.unisonht.clientapi.ClientApiObject;
import com.unisonht.config.Configuration;
import com.unisonht.plugin.status.Status;
import com.unisonht.plugin.web.routes.BaseRequestHandler;
import com.unisonht.services.DeviceService;
import org.neolumin.webster.HandlerChain;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Map;

public class StatusGet extends BaseRequestHandler {
    private final DeviceService deviceService;

    @Inject
    public StatusGet(
            Configuration configuration,
            DeviceService deviceService
    ) {
        super(configuration);
        this.deviceService = deviceService;
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, HandlerChain chain) throws Exception {
        Map<String, Status> deviceStatuses = deviceService.getAllDevicesStatus();
        Response result = new Response();
        result.deviceStatuses = deviceStatuses;
        respondWithClientApiObject(response, result);
    }

    public static class Response extends ClientApiObject {
        public Map<String, Status> deviceStatuses;
    }
}


