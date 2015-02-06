package com.unisonht.services;

import com.google.inject.Inject;
import com.unisonht.clientapi.ConfigJson;
import com.unisonht.config.Configuration;
import com.unisonht.utils.InjectHelper;
import com.unisonht.utils.UnisonhtException;
import com.unisonht.utils.UnisonhtLogger;
import com.unisonht.utils.UnisonhtLoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.FutureTask;

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
        LOGGER.debug("running action: %s", action.toString());
        if (action instanceof ConfigJson.RunMacroAction) {
            runAction((ConfigJson.RunMacroAction) action);
        } else if (action instanceof ConfigJson.SimultaneousAction) {
            runAction((ConfigJson.SimultaneousAction) action);
        } else if (action instanceof ConfigJson.SequentialAction) {
            runAction((ConfigJson.SequentialAction) action);
        } else if (action instanceof ConfigJson.EnsureOffAction) {
            runAction((ConfigJson.EnsureOffAction) action);
        } else if (action instanceof ConfigJson.EnsureOnAction) {
            runAction((ConfigJson.EnsureOnAction) action);
        } else if (action instanceof ConfigJson.DeviceButtonPressAction) {
            runAction((ConfigJson.DeviceButtonPressAction) action);
        } else if (action instanceof ConfigJson.ChangeInputAction) {
            runAction((ConfigJson.ChangeInputAction) action);
        } else if (action instanceof ConfigJson.SwitchModeAction) {
            runAction((ConfigJson.SwitchModeAction) action);
        } else {
            throw new UnisonhtException("Unhandled action type: " + action.getClass().getName());
        }
    }

    public void runAction(ConfigJson.EnsureOffAction action) {
        this.deviceService.ensureOff(action.getDevice());
    }

    public void runAction(ConfigJson.EnsureOnAction action) {
        this.deviceService.ensureOn(action.getDevice());
    }

    public void runAction(ConfigJson.DeviceButtonPressAction action) {
        this.deviceService.buttonPress(action.getDevice(), action.getButton());
    }

    public void runAction(ConfigJson.ChangeInputAction action) {
        this.deviceService.changeInput(action.getDevice(), action.getInput());
    }

    public void runAction(ConfigJson.SwitchModeAction action) {
        getModeService().switchMode(action.getMode());
    }

    private ModeService getModeService() {
        if (modeService == null) {
            modeService = InjectHelper.getInstance(ModeService.class);
        }
        return modeService;
    }

    public void runAction(ConfigJson.RunMacroAction action) {
        ConfigJson.Action macro = configuration.getConfigJson().getMacros().get(action.getName());
        if (macro == null) {
            throw new UnisonhtException("Could not find macro with name: " + action.getName());
        }
        runAction(macro);
    }

    public void runAction(ConfigJson.SequentialAction action) {
        for (ConfigJson.Action childAction : action.getActions()) {
            runAction(childAction);
        }
    }

    public void runAction(ConfigJson.SimultaneousAction action) {
        try {
            List<FutureTask<Void>> taskList = new ArrayList<>();
            for (ConfigJson.Action childAction : action.getActions()) {
                FutureTask<Void> task = new FutureTask<>(new SimultaneousActionTask(childAction));
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

        public SimultaneousActionTask(ConfigJson.Action action) {
            this.action = action;
        }

        @Override
        public Void call() throws Exception {
            try {
                runAction(this.action);
            } catch (Exception ex) {
                LOGGER.error("Could not execute action: " + this.action, ex);
            }
            return null;
        }
    }
}
