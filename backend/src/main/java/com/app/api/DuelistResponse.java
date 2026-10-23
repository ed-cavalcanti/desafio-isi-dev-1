package com.app.api;

/**
 * Lado de um duelo na resposta da partida: nome, posição, condição, atributo e
 * valor usados (RN20.7).
 */
public record DuelistResponse(Integer playerId, String name, String position, String condition, String attribute,
        Integer value) {
}
