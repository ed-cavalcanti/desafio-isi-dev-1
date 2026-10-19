package com.app.api;

import java.util.List;

/**
 * Página de jogadores com os metadados de paginação.
 */
public record PlayerPageResponse(List<PlayerResponse> data, PageMeta meta) {
}
