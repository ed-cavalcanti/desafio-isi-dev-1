package com.app.api;

/**
 * Partida enviada em POST /matches, já validada (RN20).
 */
public record MatchRequest(Integer homeClubId, Integer awayClubId) {
}
