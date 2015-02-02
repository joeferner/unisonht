package com.unisonht.utils;

public class ProcessUtil {
    public static boolean isWindows() {
        String os = System.getProperty("os.name");
        if (os == null) {
            return false;
        }
        if (os.toLowerCase().startsWith("windows")) {
            return true;
        }
        return false;
    }
}
