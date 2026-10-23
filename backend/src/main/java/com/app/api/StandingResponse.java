package com.app.api;

/**
 * Linha da classificação calculada a cada consulta (RN21.3).
 */
public record StandingResponse(Integer position, Integer clubId, String clubName, Integer played, Integer wins,
        Integer draws, Integer losses, Integer goalsFor, Integer goalsAgainst, Integer goalDifference,
        Integer points) {
}
