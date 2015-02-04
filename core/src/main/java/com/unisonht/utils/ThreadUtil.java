package com.unisonht.utils;

public class ThreadUtil {
    public static void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            throw new UnisonhtException("Could not sleep", e);
        }
    }
}
