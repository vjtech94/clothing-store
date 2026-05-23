package com.clothingstore.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class BaseException extends RuntimeException {
    private final HttpStatus status;
    private final String code;

    public BaseException(String message, HttpStatus status) {
        super(message);
        this.status = status;
        this.code = status.name();
    }

    public BaseException(String message, HttpStatus status, String code) {
        super(message);
        this.status = status;
        this.code = code;
    }
}
