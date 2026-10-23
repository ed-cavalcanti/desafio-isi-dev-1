package com.app.api;

import java.util.List;

import com.app.model.MatchOutcome;

/**
 * Partida na resposta da API, com o placar, o resultado e os seis duelos
 * (RN20.7).
 */
public record MatchResponse(Integer id, Integer homeClubId, String homeClubName, Integer awayClubId,
        String awayClubName, Integer homeGoals, Integer awayGoals, MatchOutcome result, String playedAt,
        String homeFormation, String awayFormation, List<DuelResponse> duels, MatchSideResponse home,
        MatchSideResponse away) {
}
