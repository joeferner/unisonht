package com.unisonht.services;

import com.google.inject.Singleton;

@Singleton
public class StateService {
    private String currentModeName;

    public String getCurrentModeName() {
        return currentModeName;
    }

    public void setCurrentModeName(String currentModeName) {
        this.currentModeName = currentModeName;
    }
}
