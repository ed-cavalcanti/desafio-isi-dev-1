package com.app.api;

/**
 * Lado da partida na resposta da API, com o clube, a formação e os gols
 * (RN20.7).
 */
public record MatchSideResponse(Integer clubId, String clubName, String formation, Integer goals) {
}
