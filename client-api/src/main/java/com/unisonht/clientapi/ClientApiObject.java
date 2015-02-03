package com.unisonht.clientapi;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.unisonht.clientapi.utils.ObjectMapperFactory;

public class ClientApiObject {
    @Override
    public String toString() {
        try {
            return ObjectMapperFactory.getInstance().writeValueAsString(this);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Could not serialize to string", e);
        }
    }
}
