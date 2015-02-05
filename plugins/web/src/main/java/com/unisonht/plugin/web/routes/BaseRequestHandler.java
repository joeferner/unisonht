package com.unisonht.plugin.web.routes;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Preconditions;
import com.unisonht.clientapi.ClientApiObject;
import com.unisonht.config.Configuration;
import com.unisonht.clientapi.utils.ObjectMapperFactory;
import com.unisonht.utils.UnisonhtException;
import com.unisonht.plugin.web.utils.ConnectionClosedException;
import io.lumify.miniweb.HandlerChain;
import org.apache.commons.codec.binary.Hex;
import org.apache.commons.io.IOUtils;
import org.json.JSONArray;
import org.json.JSONObject;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import java.io.*;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;

public abstract class BaseRequestHandler extends MinimalRequestHandler {
    protected static final int EXPIRES_1_HOUR = 60 * 60;
    private final ObjectMapper objectMapper = ObjectMapperFactory.getInstance();

    protected BaseRequestHandler(Configuration configuration) {
        super(configuration);
    }

    @Override
    public abstract void handle(HttpServletRequest request, HttpServletResponse response, HandlerChain chain) throws Exception;

    protected String getBaseUrl(HttpServletRequest request) {
        String configuredBaseUrl = getConfiguration().get(Configuration.BASE_URL, null);
        if (configuredBaseUrl != null && configuredBaseUrl.trim().length() > 0) {
            return configuredBaseUrl;
        }

        String scheme = request.getScheme();
        String serverName = request.getServerName();
        int port = request.getServerPort();
        String contextPath = request.getContextPath();

        StringBuilder sb = new StringBuilder();
        sb.append(scheme).append("://").append(serverName);
        if (!(scheme.equals("http") && port == 80 || scheme.equals("https") && port == 443)) {
            sb.append(":").append(port);
        }
        sb.append(contextPath);
        return sb.toString();
    }

    public static void setMaxAge(final HttpServletResponse response, int numberOfSeconds) {
        response.setHeader("Cache-Control", "max-age=" + numberOfSeconds);
    }

    public static String generateETag(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("MD5");
            byte[] md5 = digest.digest(data);
            return Hex.encodeHexString(md5);
        } catch (NoSuchAlgorithmException e) {
            throw new UnisonhtException("Could not find MD5", e);
        }
    }

    public static void addETagHeader(final HttpServletResponse response, String eTag) {
        response.setHeader("ETag", "\"" + eTag + "\"");
    }

    public boolean testEtagHeaders(HttpServletRequest request, HttpServletResponse response, String eTag) throws IOException {
        String ifNoneMatch = request.getHeader("If-None-Match");
        if (ifNoneMatch != null) {
            if (ifNoneMatch.startsWith("\"") && ifNoneMatch.length() > 2) {
                ifNoneMatch = ifNoneMatch.substring(1, ifNoneMatch.length() - 1);
            }
            if (eTag.equalsIgnoreCase(ifNoneMatch)) {
                addETagHeader(response, eTag);
                respondWithNotModified(response);
                return true;
            }
        }

        return false;
    }

    protected void respondWithNotFound(final HttpServletResponse response) throws IOException {
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
    }

    protected void respondWithNotModified(final HttpServletResponse response) throws IOException {
        response.sendError(HttpServletResponse.SC_NOT_MODIFIED);
    }

    protected void respondWithNotFound(final HttpServletResponse response, String message) throws IOException {
        response.sendError(HttpServletResponse.SC_NOT_FOUND, message);
    }

    protected void respondWithAccessDenied(final HttpServletResponse response, String message) throws IOException {
        response.sendError(HttpServletResponse.SC_FORBIDDEN, message);
    }

    /**
     * Send a Bad Request response with JSON object mapping field error messages
     */
    protected void respondWithBadRequest(final HttpServletResponse response, final String parameterName, final String errorMessage, final String invalidValue) throws IOException {
        List<String> values = null;

        if (invalidValue != null) {
            values = new ArrayList<String>();
            values.add(invalidValue);
        }
        respondWithBadRequest(response, parameterName, errorMessage, values);
    }


    /**
     * Send a Bad Request response with JSON object mapping field error messages
     */
    protected void respondWithBadRequest(final HttpServletResponse response, final String parameterName, final String errorMessage, final List<String> invalidValues) throws IOException {
        JSONObject error = new JSONObject();
        error.put(parameterName, errorMessage);
        if (invalidValues != null) {
            JSONArray values = new JSONArray();
            for (String v : invalidValues) {
                values.put(v);
            }
            error.put("invalidValues", values);
        }
        response.sendError(HttpServletResponse.SC_BAD_REQUEST, error.toString());
    }

    /**
     * Send a Bad Request response with JSON object mapping field error messages
     */
    protected void respondWithBadRequest(final HttpServletResponse response, final String parameterName, final String errorMessage) throws IOException {
        respondWithBadRequest(response, parameterName, errorMessage, new ArrayList<String>());
    }

    /**
     * Configures the content type for the provided response to contain {@link JSONObject} data
     *
     * @param response   The response instance to modify
     * @param jsonObject The JSON data to include in the response
     */
    protected void respondWithJson(final HttpServletResponse response, final JSONObject jsonObject) {
        configureResponse(ResponseTypes.JSON_OBJECT, response, jsonObject);
    }

    protected void respondWithSuccessJson(HttpServletResponse response) {
        JSONObject result = new JSONObject();
        result.put("success", true);
        respondWithJson(response, result);
    }

    protected void respondWithClientApiObject(HttpServletResponse response, ClientApiObject obj) throws IOException {
        if (obj == null) {
            respondWithNotFound(response);
            return;
        }
        try {
            String jsonObject = objectMapper.writeValueAsString(obj);
            configureResponse(ResponseTypes.JSON_OBJECT, response, jsonObject);
        } catch (JsonProcessingException e) {
            throw new UnisonhtException("Could not write json", e);
        }
    }

    /**
     * Configures the content type for the provided response to contain {@link JSONArray} data
     *
     * @param response  The response instance to modify
     * @param jsonArray The JSON data to include in the response
     */
    protected void respondWithJson(final HttpServletResponse response, final JSONArray jsonArray) {
        configureResponse(ResponseTypes.JSON_ARRAY, response, jsonArray);
    }

    protected void respondWithPlaintext(final HttpServletResponse response, final String plaintext) {
        configureResponse(ResponseTypes.PLAINTEXT, response, plaintext);
    }

    protected void respondWithHtml(final HttpServletResponse response, final String html) {
        configureResponse(ResponseTypes.HTML, response, html);
    }

    private void configureResponse(final ResponseTypes type, final HttpServletResponse response, final Object responseData) {
        Preconditions.checkNotNull(response, "The provided response was invalid");
        Preconditions.checkNotNull(responseData, "The provided data was invalid");

        try {
            switch (type) {
                case JSON_OBJECT:
                    response.setContentType("application/json");
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write(responseData.toString());
                    break;
                case JSON_ARRAY:
                    response.setContentType("application/json");
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write(responseData.toString());
                    break;
                case PLAINTEXT:
                    response.setContentType("text/plain");
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write(responseData.toString());
                    break;
                case HTML:
                    response.setContentType("text/html");
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write(responseData.toString());
                    break;
                default:
                    throw new RuntimeException("Unsupported response type encountered");
            }

            if (response.getWriter().checkError()) {
                throw new ConnectionClosedException();
            }
        } catch (IOException e) {
            throw new RuntimeException("Error occurred while writing response", e);
        }
    }

    protected void copyPartToOutputStream(Part part, OutputStream out) throws IOException {
        try (InputStream in = part.getInputStream()) {
            IOUtils.copy(in, out);
        } finally {
            out.close();

        }
    }

    protected void copyPartToFile(Part part, File outFile) throws IOException {
        FileOutputStream out = new FileOutputStream(outFile);
        copyPartToOutputStream(part, out);
    }
}
