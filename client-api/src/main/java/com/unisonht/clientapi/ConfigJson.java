package com.unisonht.clientapi;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.google.common.base.Preconditions.checkNotNull;

public class ConfigJson extends ClientApiObject {
    private final Map<String, InputPlugin> inputPlugins;
    private final Map<String, Device> devices;
    private final Map<String, Mode> modes;
    private final String defaultMode;
    private final Map<String, Action> macros;
    private final Map<String, Remote> remotes;

    public ConfigJson(
            @JsonProperty("inputPlugins") Map<String, InputPlugin> inputPlugins,
            @JsonProperty("devices") Map<String, Device> devices,
            @JsonProperty("modes") Map<String, Mode> modes,
            @JsonProperty("defaultMode") String defaultMode,
            @JsonProperty("remotes") Map<String, Remote> remotes,
            @JsonProperty("macros") Map<String, Action> macros
    ) {
        checkNotNull(inputPlugins, "inputPlugins is required");
        checkNotNull(devices, "devices is required");
        checkNotNull(modes, "modes is required");
        checkNotNull(remotes, "remotes is required");
        if (macros == null) {
            macros = new HashMap<>();
        }
        this.defaultMode = defaultMode;
        this.inputPlugins = inputPlugins;
        this.devices = devices;
        this.modes = modes;
        this.macros = macros;
        this.remotes = remotes;
    }

    public Map<String, InputPlugin> getInputPlugins() {
        return inputPlugins;
    }

    public Map<String, Device> getDevices() {
        return devices;
    }

    public Map<String, Mode> getModes() {
        return modes;
    }

    public Map<String, Action> getMacros() {
        return macros;
    }

    public Map<String, Remote> getRemotes() {
        return remotes;
    }

    public String getDefaultMode() {
        return defaultMode;
    }

    public static class InputPlugin extends ClientApiObject {
        private final String pluginClass;
        private final Map<String, Object> data;

        public InputPlugin(
                @JsonProperty("pluginClass") String pluginClass,
                @JsonProperty("data") Map<String, Object> data
        ) {
            checkNotNull(pluginClass, "pluginClass is required");
            if (data == null) {
                data = new HashMap<>();
            }
            this.pluginClass = pluginClass;
            this.data = data;
        }

        public Map<String, Object> getData() {
            return data;
        }

        public String getPluginClass() {
            return pluginClass;
        }
    }

    public static class Device extends ClientApiObject {
        private final String deviceClass;
        private final Map<String, Object> data;

        public Device(
                @JsonProperty("deviceClass") String deviceClass,
                @JsonProperty("data") Map<String, Object> data
        ) {
            checkNotNull(deviceClass, "deviceClass is required");
            if (data == null) {
                data = new HashMap<>();
            }
            this.deviceClass = deviceClass;
            this.data = data;
        }

        public Map<String, Object> getData() {
            return data;
        }

        public String getDeviceClass() {
            return deviceClass;
        }
    }

    public static class Mode extends ClientApiObject {
        private final String defaultDevice;
        private final Map<String, Action> buttonMap;
        private final Action onEnter;
        private final Action onExit;

        public Mode(
                @JsonProperty("defaultDevice") String defaultDevice,
                @JsonProperty("buttonMap") Map<String, Action> buttonMap,
                @JsonProperty("onEnter") Action onEnter,
                @JsonProperty("onExit") Action onExit
        ) {
            if (buttonMap == null) {
                buttonMap = new HashMap<>();
            }
            this.defaultDevice = defaultDevice;
            this.buttonMap = buttonMap;
            this.onEnter = onEnter;
            this.onExit = onExit;
        }

        public Map<String, Action> getButtonMap() {
            return buttonMap;
        }

        public Action getOnEnter() {
            return onEnter;
        }

        public Action getOnExit() {
            return onExit;
        }

        public String getDefaultDevice() {
            return defaultDevice;
        }
    }

    @JsonTypeInfo(
            use = JsonTypeInfo.Id.NAME,
            include = JsonTypeInfo.As.PROPERTY,
            property = "action")
    @JsonSubTypes({
            @JsonSubTypes.Type(value = DeviceButtonPressAction.class, name = "deviceButtonPress"),
            @JsonSubTypes.Type(value = SimultaneousAction.class, name = "simultaneous"),
            @JsonSubTypes.Type(value = SequentialAction.class, name = "sequential"),
            @JsonSubTypes.Type(value = EnsureOffAction.class, name = "ensureOff"),
            @JsonSubTypes.Type(value = EnsureOnAction.class, name = "ensureOn"),
            @JsonSubTypes.Type(value = RunMacroAction.class, name = "runMacro"),
            @JsonSubTypes.Type(value = SwitchModeAction.class, name = "switchMode"),
            @JsonSubTypes.Type(value = ChangeInputAction.class, name = "changeInput"),
            @JsonSubTypes.Type(value = RunAction.class, name = "run"),
            @JsonSubTypes.Type(value = KillAction.class, name = "kill")
    })
    public abstract static class Action extends ClientApiObject {
    }

    public static class DeviceButtonPressAction extends Action {
        private final String device;
        private final String button;

        protected DeviceButtonPressAction(
                @JsonProperty("device") String device,
                @JsonProperty("button") String button
        ) {
            checkNotNull(device, "device is required");
            checkNotNull(button, "button is required");
            this.device = device;
            this.button = button;
        }

        public String getDevice() {
            return device;
        }

        public String getButton() {
            return button;
        }
    }

    public static class SimultaneousAction extends Action {
        private final List<Action> actions;

        public SimultaneousAction(
                @JsonProperty("actions") List<Action> actions
        ) {
            checkNotNull(actions, "actions is required");
            this.actions = actions;
        }

        public List<Action> getActions() {
            return actions;
        }
    }

    public static class SequentialAction extends Action {
        private final List<Action> actions;

        public SequentialAction(
                @JsonProperty("actions") List<Action> actions
        ) {
            checkNotNull(actions, "actions is required");
            this.actions = actions;
        }

        public List<Action> getActions() {
            return actions;
        }
    }

    public static class EnsureOffAction extends Action {
        private final String device;

        protected EnsureOffAction(
                @JsonProperty("device") String device
        ) {
            checkNotNull(device, "device is required");
            this.device = device;
        }

        public String getDevice() {
            return device;
        }
    }

    public static class EnsureOnAction extends Action {
        private final String device;

        protected EnsureOnAction(
                @JsonProperty("device") String device
        ) {
            checkNotNull(device, "device is required");
            this.device = device;
        }

        public String getDevice() {
            return device;
        }
    }

    public static class RunMacroAction extends Action {
        private final String name;
        private final Map<String, Object> args;

        protected RunMacroAction(
                @JsonProperty("name") String name,
                @JsonProperty("args") Map<String, Object> args
        ) {
            checkNotNull(name, "name is required");
            if (args == null) {
                args = new HashMap<>();
            }
            this.args = args;
            this.name = name;
        }

        public String getName() {
            return name;
        }

        public Map<String, Object> getArgs() {
            return args;
        }
    }

    public static class SwitchModeAction extends Action {
        private final String mode;

        public SwitchModeAction(
                @JsonProperty("mode") String mode
        ) {
            checkNotNull(mode, "mode is required");
            this.mode = mode;
        }

        public String getMode() {
            return mode;
        }
    }

    public static class ChangeInputAction extends Action {
        private final String device;
        private final String input;

        public ChangeInputAction(
                @JsonProperty("device") String device,
                @JsonProperty("input") String input
        ) {
            checkNotNull(device, "device is required");
            checkNotNull(input, "input is required");
            this.device = device;
            this.input = input;
        }

        public String getDevice() {
            return device;
        }

        public String getInput() {
            return input;
        }
    }

    public static class RunAction extends Action {
        private final String[] command;

        public RunAction(
                @JsonProperty("command") String[] command
        ) {
            checkNotNull(command, "command is required");
            this.command = command;
        }

        public String[] getCommand() {
            return command;
        }
    }

    public static class KillAction extends Action {
        private final String processName;

        public KillAction(@JsonProperty("processName") String processName) {
            this.processName = processName;
        }

        public String getProcessName() {
            return processName;
        }
    }

    public static class Remote extends ClientApiObject {
        private final String imageFilename;
        private final Map<String, Button> buttonMap;

        public Remote(
                @JsonProperty("imageFilename") String imageFilename,
                @JsonProperty("buttonMap") Map<String, Button> buttonMap
        ) {
            this.imageFilename = imageFilename;
            this.buttonMap = buttonMap;
        }

        public String getImageFilename() {
            return imageFilename;
        }

        public Map<String, Button> getButtonMap() {
            return buttonMap;
        }

        public static class Button {
            private final int[] coords;

            public Button(
                    @JsonProperty("coords") int[] coords
            ) {
                this.coords = coords;
            }

            public int[] getCoords() {
                return coords;
            }
        }
    }
}
