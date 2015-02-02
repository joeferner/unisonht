package com.unisonht.web.routes;

import com.google.common.base.Preconditions;
import com.unisonht.config.Configuration;
import com.unisonht.utils.UnisonhtException;
import com.unisonht.web.WebApp;
import io.lumify.miniweb.App;
import io.lumify.miniweb.Handler;

import javax.servlet.http.HttpServletRequest;

public abstract class MinimalRequestHandler implements Handler {
    private static final String LOCALE_LANGUAGE_PARAMETER = "localeLanguage";
    private static final String LOCALE_COUNTRY_PARAMETER = "localeCountry";
    private static final String LOCALE_VARIANT_PARAMETER = "localeVariant";

    private final Configuration configuration;

    protected MinimalRequestHandler(Configuration configuration) {
        this.configuration = configuration;
    }

    protected Configuration getConfiguration() {
        return configuration;
    }

    protected WebApp getWebApp(HttpServletRequest request) {
        return (WebApp) App.getApp(request);
    }

    /**
     * Attempts to extract the specified parameter from the provided request
     *
     * @param request       The request instance containing the parameter
     * @param parameterName The name of the parameter to extract
     * @return The value of the specified parameter
     * @throws RuntimeException Thrown if the required parameter was not in the request
     */
    protected String getRequiredParameter(final HttpServletRequest request, final String parameterName) {
        Preconditions.checkNotNull(request, "The provided request was invalid");

        return getParameter(request, parameterName, false);
    }

    protected String[] getOptionalParameterArray(HttpServletRequest request, String parameterName) {
        Preconditions.checkNotNull(request, "The provided request was invalid");

        return request.getParameterValues(parameterName);
    }

    protected String[] getRequiredParameterArray(HttpServletRequest request, String parameterName) {
        Preconditions.checkNotNull(request, "The provided request was invalid");

        String[] value = request.getParameterValues(parameterName);
        if (value == null) {
            throw new UnisonhtException(String.format("Parameter: '%s' is required in the request", parameterName));
        }
        return value;
    }

    protected long getOptionalParameterLong(final HttpServletRequest request, final String parameterName, long defaultValue) {
        String val = getOptionalParameter(request, parameterName);
        if (val == null) {
            return defaultValue;
        }
        return Long.parseLong(val);
    }

    protected boolean getOptionalParameterBoolean(final HttpServletRequest request, final String parameterName, boolean defaultValue) {
        String val = getOptionalParameter(request, parameterName);
        if (val == null) {
            return defaultValue;
        }
        return Boolean.parseBoolean(val);
    }

    protected double getOptionalParameterDouble(final HttpServletRequest request, final String parameterName, double defaultValue) {
        String val = getOptionalParameter(request, parameterName);
        if (val == null) {
            return defaultValue;
        }
        return Double.parseDouble(val);
    }

    /**
     * Attempts to extract the specified parameter from the provided request and convert it to a long value
     *
     * @param request       The request instance containing the parameter
     * @param parameterName The name of the parameter to extract
     * @return The long value of the specified parameter
     * @throws RuntimeException Thrown if the required parameter was not in the request
     */
    protected long getRequiredParameterAsLong(final HttpServletRequest request, final String parameterName) {
        return Long.parseLong(getRequiredParameter(request, parameterName));
    }

    /**
     * Attempts to extract the specified parameter from the provided request and convert it to a double value
     *
     * @param request       The request instance containing the parameter
     * @param parameterName The name of the parameter to extract
     * @return The double value of the specified parameter
     * @throws RuntimeException Thrown if the required parameter was not in the request
     */
    protected double getRequiredParameterAsDouble(final HttpServletRequest request, final String parameterName) {
        return Double.parseDouble(getRequiredParameter(request, parameterName));
    }

    /**
     * Attempts to extract the specified parameter from the provided request, if available
     *
     * @param request       The request instance containing the parameter
     * @param parameterName The name of the parameter to extract
     * @return The value of the specified parameter if found, null otherwise
     */
    protected String getOptionalParameter(final HttpServletRequest request, final String parameterName) {
        Preconditions.checkNotNull(request, "The provided request was invalid");

        return getParameter(request, parameterName, true);
    }

    protected String[] getOptionalParameterAsStringArray(final HttpServletRequest request, final String parameterName) {
        Preconditions.checkNotNull(request, "The provided request was invalid");

        return getParameterValues(request, parameterName, true);
    }

    protected String[] getParameterValues(final HttpServletRequest request, final String parameterName, final boolean optional) {
        final String[] paramValues = request.getParameterValues(parameterName);

        if (paramValues == null) {
            if (!optional) {
                throw new RuntimeException(String.format("Parameter: '%s' is required in the request", parameterName));
            }
            return null;
        }

        return paramValues;
    }

    private String getParameter(final HttpServletRequest request, final String parameterName, final boolean optional) {
        final String paramValue = request.getParameter(parameterName);

        if (paramValue == null) {
            if (!optional) {
                throw new UnisonhtException(String.format("Parameter: '%s' is required in the request", parameterName));
            }

            return null;
        }

        return paramValue;
    }

    protected String getAttributeString(final HttpServletRequest request, final String name) {
        String attr = (String) request.getAttribute(name);
        if (attr != null) {
            return attr;
        }
        return getRequiredParameter(request, name);
    }
}
