package com.app.api;

import com.app.model.MatchOutcome;

/**
 * Partida no histórico de partidas, com o placar e o resultado (RN21.1).
 */
public record MatchSummaryResponse(Integer id, Integer homeClubId, String homeClubName, Integer awayClubId,
        String awayClubName, Integer homeGoals, Integer awayGoals, MatchOutcome result, String playedAt) {
}
