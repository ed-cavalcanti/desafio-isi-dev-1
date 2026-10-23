package com.app.api;

/**
 * Duelo da partida na resposta da API, numerado de 1 a 6 (RN20.7).
 */
public record DuelResponse(Integer order, DuelistResponse attacker, DuelistResponse defender, Boolean goal) {
}
