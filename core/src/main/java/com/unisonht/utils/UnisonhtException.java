package com.unisonht.utils;

public class UnisonhtException extends RuntimeException {
    public UnisonhtException() {
    }

    public UnisonhtException(String message) {
        super(message);
    }

    public UnisonhtException(String message, Throwable cause) {
        super(message, cause);
    }
}
