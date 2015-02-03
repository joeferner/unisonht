package com.unisonht.clientapi;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ConfigJson extends ClientApiObject {
    private Map<String, Device> devices = new HashMap<>();
    private Map<String, Mode> modes = new HashMap<>();
    private Map<String, Action> macros = new HashMap<>();
    private Map<String, Remote> remotes = new HashMap<>();

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

    public static class Device extends ClientApiObject {
        private String deviceClass;
        private Map<String, Object> data = new HashMap<>();

        public Map<String, Object> getData() {
            return data;
        }

        public String getDeviceClass() {
            return deviceClass;
        }

        public void setDeviceClass(String deviceClass) {
            this.deviceClass = deviceClass;
        }
    }

    public static class Mode extends ClientApiObject {
        private Map<String, Action> buttonMap = new HashMap<>();
        private Action onEnter;

        public Map<String, Action> getButtonMap() {
            return buttonMap;
        }

        public void setButtonMap(Map<String, Action> buttonMap) {
            this.buttonMap = buttonMap;
        }

        public Action getOnEnter() {
            return onEnter;
        }

        public void setOnEnter(Action onEnter) {
            this.onEnter = onEnter;
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
            @JsonSubTypes.Type(value = ChangeInputAction.class, name = "changeInput")
    })
    public abstract static class Action extends ClientApiObject {
        private String action;

        public String getAction() {
            return action;
        }

        public void setAction(String action) {
            this.action = action;
        }
    }

    public static class DeviceButtonPressAction extends Action {
        private String device;
        private String button;

        public String getDevice() {
            return device;
        }

        public void setDevice(String device) {
            this.device = device;
        }

        public String getButton() {
            return button;
        }

        public void setButton(String button) {
            this.button = button;
        }
    }

    public static class SimultaneousAction extends Action {
        private List<Action> actions = new ArrayList<>();

        public List<Action> getActions() {
            return actions;
        }
    }

    public static class SequentialAction extends Action {
        private List<Action> actions = new ArrayList<>();

        public List<Action> getActions() {
            return actions;
        }
    }

    public static class EnsureOffAction extends Action {
        private String device;

        public String getDevice() {
            return device;
        }

        public void setDevice(String device) {
            this.device = device;
        }
    }

    public static class EnsureOnAction extends Action {
        private String device;

        public String getDevice() {
            return device;
        }

        public void setDevice(String device) {
            this.device = device;
        }
    }

    public static class RunMacroAction extends Action {
        private String name;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }

    public static class SwitchModeAction extends Action {
        private String mode;

        public String getMode() {
            return mode;
        }

        public void setMode(String mode) {
            this.mode = mode;
        }
    }

    public static class ChangeInputAction extends Action {
        private String device;
        private String input;

        public String getDevice() {
            return device;
        }

        public void setDevice(String device) {
            this.device = device;
        }

        public String getInput() {
            return input;
        }

        public void setInput(String input) {
            this.input = input;
        }
    }

    public static class Remote extends ClientApiObject {
        private String imageFilename;
        private Map<String, Button> buttonMap = new HashMap<>();

        public String getImageFilename() {
            return imageFilename;
        }

        public void setImageFilename(String imageFilename) {
            this.imageFilename = imageFilename;
        }

        public Map<String, Button> getButtonMap() {
            return buttonMap;
        }

        public static class Button {
            private int[] coords;

            public int[] getCoords() {
                return coords;
            }

            public void setCoords(int[] coords) {
                this.coords = coords;
            }
        }
    }
}
