package com.unisonht.plugin.status;

public interface StatusInput {
    Input getInput();

    class Input {
        private final String deviceInput;
        private final String mappedInput;

        public Input(String deviceInput, String mappedInput) {
            this.deviceInput = deviceInput;
            this.mappedInput = mappedInput;
        }

        public String getDeviceInput() {
            return deviceInput;
        }

        public String getMappedInput() {
            return mappedInput;
        }
    }
}
