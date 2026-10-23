package com.app.api;

/**
 * Dados enviados no corpo de POST /clubs, já validados e normalizados (V4).
 */
public record ClubRequest(String name, String acronym) {
}
