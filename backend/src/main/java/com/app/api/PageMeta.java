package com.app.api;

/**
 * Metadados da paginação devolvidos pela API.
 */
public record PageMeta(int page, int limit, int totalItems, int totalPages) {
}
