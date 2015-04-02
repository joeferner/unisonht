package com.unisonht.plugin.web.routes.config;

import com.google.inject.Inject;
import com.unisonht.clientapi.ConfigJson;
import com.unisonht.config.Configuration;
import com.unisonht.plugin.web.routes.BaseRequestHandler;
import org.apache.commons.io.IOUtils;
import org.neolumin.webster.HandlerChain;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;

public class ConfigGetRemoteImage extends BaseRequestHandler {
    @Inject
    public ConfigGetRemoteImage(Configuration configuration) {
        super(configuration);
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, HandlerChain chain) throws Exception {
        String remoteName = getAttributeString(request, "remoteName");

        ConfigJson.Remote remote = getConfiguration().getConfigJson().getRemotes().get(remoteName);
        if (remote == null) {
            respondWithNotFound(response, "Could not find remote with name '" + remoteName + "'");
            return;
        }

        File remoteImageFile = getConfiguration().resolveFileName(remote.getImageFilename());
        if (remoteImageFile == null) {
            respondWithNotFound(response, "Could not find remote image for '" + remoteName + "'");
            return;
        }

        if (!remoteImageFile.exists()) {
            respondWithNotFound(response, "Could not find remote image file '" + remoteImageFile.getAbsolutePath() + "'");
            return;
        }

        FileInputStream in = new FileInputStream(remoteImageFile);

        IOUtils.copy(in, response.getOutputStream());
    }
}
