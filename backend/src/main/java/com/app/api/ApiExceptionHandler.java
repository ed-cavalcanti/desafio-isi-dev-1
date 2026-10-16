package com.app.api;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    ResponseEntity<Map<String, String>> apiError(ApiException exception) {
        return response(exception.status(), exception.getMessage());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<Map<String, String>> unreadableBody() {
        return response(400, "Corpo da requisição deve ser um objeto JSON válido.");
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    ResponseEntity<Map<String, String>> invalidParameter(MethodArgumentTypeMismatchException exception) {
        return response(400, "O parâmetro " + exception.getName() + " é inválido.");
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    ResponseEntity<Map<String, String>> missingParameter(MissingServletRequestParameterException exception) {
        return response(400, "O parâmetro " + exception.getParameterName() + " é obrigatório.");
    }

    @ExceptionHandler(NoResourceFoundException.class)
    ResponseEntity<Map<String, String>> resourceNotFound() {
        return response(404, "Recurso não encontrado.");
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    ResponseEntity<Map<String, String>> handlerNotFound() {
        return response(404, "Recurso não encontrado.");
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    ResponseEntity<Map<String, String>> methodNotSupported() {
        return response(405, "Método HTTP não suportado para este recurso.");
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<Map<String, String>> dataIntegrity(DataIntegrityViolationException exception) {
        log.warn("Violação de integridade do banco de dados", exception);
        return response(409, "A operação conflita com dados já existentes.");
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, String>> unexpected(Exception exception) {
        HttpStatusCode status = clientErrorStatus(exception);
        if (status != null) {
            return response(status.value(), messageOf(exception));
        }
        log.error("Erro inesperado", exception);
        return response(500, "Erro interno inesperado.");
    }

    private HttpStatusCode clientErrorStatus(Exception exception) {
        if (exception instanceof ErrorResponse errorResponse && errorResponse.getStatusCode().is4xxClientError()) {
            return errorResponse.getStatusCode();
        }
        return null;
    }

    private String messageOf(Exception exception) {
        String message = exception.getMessage();
        return message == null || message.isBlank() ? "Requisição inválida." : message;
    }

    private ResponseEntity<Map<String, String>> response(int status, String message) {
        return ResponseEntity.status(status).body(Map.of("message", message));
    }
}
