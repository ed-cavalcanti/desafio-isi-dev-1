package com.app.api;

/**
 * Paginação validada de GET /players.
 */
public record PlayerListQuery(int page, int limit) {
}
