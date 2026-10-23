package com.app.model;

/**
 * Lado de um duelo, com o atributo e o valor usados já com o efeito da condição
 * (RN20.5).
 */
public record DuelistSnapshot(Integer playerId, String name, Position position, Condition condition,
        Attribute attribute, int value) {
}
