package com.app.api;

/**
 * Filtro aceito por GET /matches (RN21.1): o clube mandante ou visitante.
 */
public record MatchQuery(Integer clubId) {
}
