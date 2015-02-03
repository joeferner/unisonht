package com.unisonht.config;

import com.unisonht.clientapi.ConfigJson;
import com.unisonht.clientapi.utils.ObjectMapperFactory;
import com.unisonht.utils.*;
import org.apache.commons.beanutils.ConvertUtilsBean;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.*;

public final class Configuration {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(Configuration.class);
    private static final String LINE_SEPARATOR = System.getProperty("line.separator");
    public static final String BASE_URL = "base.url";
    private Map<String, String> config = new HashMap<>();
    private final ConfigurationLoader configurationLoader;

    protected Configuration(final ConfigurationLoader configurationLoader, final Map<?, ?> config) {
        this.configurationLoader = configurationLoader;
        for (Map.Entry entry : config.entrySet()) {
            if (entry.getValue() != null) {
                set(entry.getKey().toString(), entry.getValue());
            }
        }
    }

    public String get(String propertyKey, String defaultValue) {
        return config.containsKey(propertyKey) ? config.get(propertyKey) : defaultValue;
    }

    public boolean getBoolean(String propertyKey, boolean defaultValue) {
        return Boolean.parseBoolean(get(propertyKey, Boolean.toString(defaultValue)));
    }

    public Integer getInt(String propertyKey, Integer defaultValue) {
        return Integer.parseInt(get(propertyKey, defaultValue == null ? null : defaultValue.toString()));
    }

    public Integer getInt(String propertyKey) {
        return getInt(propertyKey, null);
    }

    public <T> Class<? extends T> getClass(String propertyKey) {
        String className = get(propertyKey, null);
        if (className == null) {
            throw new UnisonhtException("Could not find required property " + propertyKey);
        }
        try {
            LOGGER.debug("found class \"%s\" for configuration \"%s\"", className, propertyKey);
            return ClassUtil.forName(className);
        } catch (Exception e) {
            throw new UnisonhtException("Could not load class " + className + " for property " + propertyKey, e);
        }
    }

    public Map<String, String> getSubset(String keyPrefix) {
        Map<String, String> subset = new HashMap<>();
        for (Map.Entry<String, String> entry : this.config.entrySet()) {
            if (!entry.getKey().startsWith(keyPrefix + ".") && !entry.getKey().equals(keyPrefix)) {
                continue;
            }
            String newKey = entry.getKey().substring(keyPrefix.length());
            if (newKey.startsWith(".")) {
                newKey = newKey.substring(1);
            }
            subset.put(newKey, entry.getValue());
        }
        return subset;
    }

    public void setConfigurables(Object o, String keyPrefix) {
        Map<String, String> subset = getSubset(keyPrefix);
        setConfigurables(o, subset);
    }

    public void setConfigurables(Object o, Map<String, String> config) {
        ConvertUtilsBean convertUtilsBean = new ConvertUtilsBean();
        Map<Method, PostConfigurationValidator> validatorMap = new HashMap<>();

        for (Method m : o.getClass().getMethods()) {
            Configurable configurableAnnotation = m.getAnnotation(Configurable.class);
            if (configurableAnnotation != null) {
                if (m.getParameterTypes().length != 1) {
                    throw new UnisonhtException("Invalid method to be configurable. Expected 1 argument. Found " + m.getParameterTypes().length + " arguments");
                }

                String propName = m.getName().substring("set".length());
                if (propName.length() > 1) {
                    propName = propName.substring(0, 1).toLowerCase() + propName.substring(1);
                }

                String name;
                String defaultValue;
                if (configurableAnnotation.name() != null) {
                    name = configurableAnnotation.name();
                    defaultValue = configurableAnnotation.defaultValue();
                } else {
                    name = propName;
                    defaultValue = null;
                }
                String val;
                if (config.containsKey(name)) {
                    val = config.get(name);
                } else {
                    if (Configurable.DEFAULT_VALUE.equals(defaultValue)) {
                        if (configurableAnnotation.required()) {
                            throw new UnisonhtException("Could not find property " + name + " for " + o.getClass().getName() + " and no default value was specified.");
                        } else {
                            continue;
                        }
                    }
                    val = defaultValue;
                }
                try {
                    Object convertedValue = convertUtilsBean.convert(val, m.getParameterTypes()[0]);
                    m.invoke(o, convertedValue);
                } catch (Exception ex) {
                    throw new UnisonhtException("Could not set property " + m.getName() + " on " + o.getClass().getName());
                }
            }

            PostConfigurationValidator validatorAnnotation = m.getAnnotation(PostConfigurationValidator.class);
            if (validatorAnnotation != null) {
                if (m.getParameterTypes().length != 0) {
                    throw new UnisonhtException("Invalid validator method " + o.getClass().getName() + "." + m.getName() + "(). Expected 0 arguments. Found " + m.getParameterTypes().length + " arguments");
                }
                if (m.getReturnType() != Boolean.TYPE) {
                    throw new UnisonhtException("Invalid validator method " + o.getClass().getName() + "." + m.getName() + "(). Expected Boolean return type. Found " + m.getReturnType());
                }
                validatorMap.put(m, validatorAnnotation);
            }
        }

        for (Method method : validatorMap.keySet()) {
            try {
                if (!(Boolean) method.invoke(o)) {
                    String description = validatorMap.get(method).description();
                    description = description.equals("") ? "()" : "(" + description + ")";
                    throw new UnisonhtException(o.getClass().getName() + "." + method.getName() + description + " returned false");
                }
            } catch (InvocationTargetException e) {
                throw new UnisonhtException("InvocationTargetException invoking validator " + o.getClass().getName() + "." + method.getName(), e);
            } catch (IllegalAccessException e) {
                throw new UnisonhtException("IllegalAccessException invoking validator " + o.getClass().getName() + "." + method.getName(), e);
            }
        }
    }

    public Map toMap() {
        return this.config;
    }

    public Iterable<String> getKeys() {
        return this.config.keySet();
    }

    public Iterable<String> getKeys(String keyPrefix) {
        getSubset(keyPrefix).keySet();
        Set<String> keys = new TreeSet<>();
        for (String key : getKeys()) {
            if (key.startsWith(keyPrefix)) {
                keys.add(key);
            }
        }
        return keys;
    }

    public void set(String propertyKey, Object value) {
        if (value == null) {
            config.remove(propertyKey);
        } else {
            config.put(propertyKey, value.toString());
        }
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        SortedSet<String> keys = new TreeSet<>(this.config.keySet());

        boolean first = true;
        for (String key : keys) {
            if (first) {
                first = false;
            } else {
                sb.append(LINE_SEPARATOR);
            }
            if (key.toLowerCase().contains("password")) {
                sb.append(key).append(": ********");
            } else {
                sb.append(key).append(": ").append(get(key, null));
            }
        }

        return sb.toString();
    }

    public File resolveFileName(String fileName) {
        return this.configurationLoader.resolveFileName(fileName);
    }

    public Map<String, Map<String, String>> getMultiValue(String prefix) {
        return getMultiValue(this.config.entrySet(), prefix);
    }

    /**
     * Processing configuration items that looks like this:
     * <p/>
     * repository.ontology.owl.dev.iri=http://lumify.io/dev
     * repository.ontology.owl.dev.dir=examples/ontology-dev/
     * <p/>
     * repository.ontology.owl.csv.iri=http://lumify.io/csv
     * repository.ontology.owl.csv.dir=storm/plugins/csv/ontology/
     * <p/>
     * Into a hash like this:
     * <p/>
     * - dev
     * - iri: http://lumify.io/dev
     * - dir: examples/ontology-dev/
     * - csv
     * - iri: http://lumify.io/csv
     * - dir: storm/plugins/csv/ontology/
     */
    public static Map<String, Map<String, String>> getMultiValue(Iterable<Map.Entry<String, String>> config, String prefix) {
        if (!prefix.endsWith(".")) {
            prefix = prefix + ".";
        }

        Map<String, Map<String, String>> results = new HashMap<>();
        for (Map.Entry<String, String> item : config) {
            if (item.getKey().startsWith(prefix)) {
                String rest = item.getKey().substring(prefix.length());
                int ch = rest.indexOf('.');
                String key;
                String subkey;
                if (ch > 0) {
                    key = rest.substring(0, ch);
                    subkey = rest.substring(ch + 1);
                } else {
                    key = rest;
                    subkey = "";
                }
                Map<String, String> values = results.get(key);
                if (values == null) {
                    values = new HashMap<>();
                    results.put(key, values);
                }
                values.put(subkey, item.getValue());
            }
        }
        return results;
    }

    public ConfigJson getConfigJson() {
        File configJsonFile = resolveFileName("config.json");
        try {
            return ObjectMapperFactory.getInstance().readValue(configJsonFile, ConfigJson.class);
        } catch (IOException ex) {
            throw new UnisonhtException("Could not read: " + configJsonFile.getAbsolutePath(), ex);
        }
    }
}
