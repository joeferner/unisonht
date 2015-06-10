package com.unisonht.services;

import com.google.common.base.Joiner;
import com.google.inject.Inject;
import com.unisonht.clientapi.ConfigJson;
import com.unisonht.config.Configuration;
import com.unisonht.utils.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.FutureTask;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ActionService {
    private static final UnisonhtLogger LOGGER = UnisonhtLoggerFactory.getLogger(ActionService.class);
    private final Configuration configuration;
    private final DeviceService deviceService;
    private ModeService modeService;
    private final ExecutorService executor;

    @Inject
    public ActionService(
            Configuration configuration,
            DeviceService deviceService
    ) {
        this.configuration = configuration;
        this.deviceService = deviceService;
        this.executor = Executors.newFixedThreadPool(5);
    }

    public void runAction(ConfigJson.Action action) {
        runAction(action, new HashMap<String, Object>());
    }

    public void runAction(ConfigJson.Action action, Map<String, Object> args) {
        LOGGER.debug("running action: %s", action.toString());
        if (action instanceof ConfigJson.RunMacroAction) {
            runAction((ConfigJson.RunMacroAction) action, args);
        } else if (action instanceof ConfigJson.SimultaneousAction) {
            runAction((ConfigJson.SimultaneousAction) action, args);
        } else if (action instanceof ConfigJson.SequentialAction) {
            runAction((ConfigJson.SequentialAction) action, args);
        } else if (action instanceof ConfigJson.EnsureOffAction) {
            runAction((ConfigJson.EnsureOffAction) action, args);
        } else if (action instanceof ConfigJson.EnsureOnAction) {
            runAction((ConfigJson.EnsureOnAction) action, args);
        } else if (action instanceof ConfigJson.DeviceButtonPressAction) {
            runAction((ConfigJson.DeviceButtonPressAction) action, args);
        } else if (action instanceof ConfigJson.ChangeInputAction) {
            runAction((ConfigJson.ChangeInputAction) action, args);
        } else if (action instanceof ConfigJson.SwitchModeAction) {
            runAction((ConfigJson.SwitchModeAction) action, args);
        } else if (action instanceof ConfigJson.RunAction) {
            runAction((ConfigJson.RunAction) action, args);
        } else if (action instanceof ConfigJson.KillAction) {
            runAction((ConfigJson.KillAction) action, args);
        } else {
            throw new UnisonhtException("Unhandled action type: " + action.getClass().getName());
        }
    }

    public void runAction(ConfigJson.EnsureOffAction action, Map<String, Object> args) {
        String deviceName = performSubstitutions(action.getDevice(), args);
        this.deviceService.ensureOff(deviceName);
    }

    public void runAction(ConfigJson.EnsureOnAction action, Map<String, Object> args) {
        String deviceName = performSubstitutions(action.getDevice(), args);
        this.deviceService.ensureOn(deviceName);
    }

    public void runAction(ConfigJson.DeviceButtonPressAction action, Map<String, Object> args) {
        String deviceName = performSubstitutions(action.getDevice(), args);
        String buttonName = performSubstitutions(action.getButton(), args);
        this.deviceService.buttonPress(deviceName, buttonName);
    }

    public void runAction(ConfigJson.ChangeInputAction action, Map<String, Object> args) {
        String deviceName = performSubstitutions(action.getDevice(), args);
        String input = performSubstitutions(action.getInput(), args);
        this.deviceService.changeInput(deviceName, input);
    }

    public void runAction(ConfigJson.SwitchModeAction action, Map<String, Object> args) {
        String modeName = performSubstitutions(action.getMode(), args);
        getModeService().switchMode(modeName);
    }

    public void runAction(ConfigJson.RunAction action, Map<String, Object> args) {
        try {
            Runtime.getRuntime().exec(action.getCommand());
        } catch (IOException e) {
            throw new UnisonhtException("Could not run command: " + Joiner.on(" ").join(action.getCommand()), e);
        }
    }

    public void runAction(ConfigJson.KillAction action, Map<String, Object> args) {
        try {
            Runtime rt = Runtime.getRuntime();
            if (System.getProperty("os.name").toLowerCase().contains("windows")) {
                rt.exec("taskkill " + action.getProcessName());
            } else {
                rt.exec("kill -9 " + action.getProcessName());
            }
        } catch (IOException e) {
            throw new UnisonhtException("Could not run kill: " + action.getProcessName(), e);
        }
    }

    private ModeService getModeService() {
        if (modeService == null) {
            modeService = InjectHelper.getInstance(ModeService.class);
        }
        return modeService;
    }

    public void runAction(ConfigJson.RunMacroAction action, Map<String, Object> args) {
        String macroName = performSubstitutions(action.getName(), args);
        ConfigJson.Action macro = configuration.getConfigJson().getMacros().get(macroName);
        if (macro == null) {
            throw new UnisonhtException("Could not find macro with name: " + macroName);
        }
        Map<String, Object> newArgs = new HashMap<>(args);
        newArgs.putAll(action.getArgs());
        runAction(macro, newArgs);
    }

    public void runAction(ConfigJson.SequentialAction action, Map<String, Object> args) {
        for (ConfigJson.Action childAction : action.getActions()) {
            runAction(childAction, args);
        }
    }

    public void runAction(ConfigJson.SimultaneousAction action, Map<String, Object> args) {
        try {
            List<FutureTask<Void>> taskList = new ArrayList<>();
            for (ConfigJson.Action childAction : action.getActions()) {
                FutureTask<Void> task = new FutureTask<>(new SimultaneousActionTask(childAction, args));
                executor.execute(task);
                taskList.add(task);
            }

            for (FutureTask<Void> task : taskList) {
                task.get();
            }
        } catch (Exception ex) {
            throw new UnisonhtException("Could not execute simultaneous action: " + action, ex);
        }
    }

    private class SimultaneousActionTask implements Callable<Void> {
        private final ConfigJson.Action action;
        private final Map<String, Object> args;

        public SimultaneousActionTask(ConfigJson.Action action, Map<String, Object> args) {
            this.action = action;
            this.args = args;
        }

        @Override
        public Void call() throws Exception {
            try {
                runAction(this.action, this.args);
            } catch (Exception ex) {
                LOGGER.error("Could not execute action: " + this.action, ex);
            }
            return null;
        }
    }

    private String performSubstitutions(String str, final Map<String, Object> args) {
        Pattern regex = Pattern.compile("\\$\\{(.*?)\\}");
        return StringReplacer.replace(str, regex, new StringReplacer.Callback() {
            @Override
            public String replace(Matcher m) {
                String expr = m.group(1);
                String result = evaluateSubstitutionExpression(expr, args);
                LOGGER.debug("evaluated expression %s to %s", expr, result);
                return result;
            }
        });
    }

    @SuppressWarnings("unchecked")
    private String evaluateSubstitutionExpression(String expression, Map<String, Object> args) {
        String[] parts = expression.split("\\.");
        Object result = null;
        for (String part : parts) {
            result = args.get(part);
            if (result instanceof Map) {
                args = (Map<String, Object>) result;
            }
        }
        return result == null ? "" : result.toString();
    }
}
