package com.unisonht.plugin.status;

public class StatusError extends Status {
    private final String errorMessage;

    public StatusError(Throwable ex) {
        this.errorMessage = ex.getMessage();
    }

    public String getErrorMessage() {
        return errorMessage;
    }
}
