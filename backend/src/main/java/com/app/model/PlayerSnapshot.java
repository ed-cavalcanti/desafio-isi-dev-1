package com.app.model;

/**
 * Titular usado na simulação da partida, com os dados do momento dela (RN20.2).
 */
public record PlayerSnapshot(Integer id, String name, Position position, Condition condition,
        PlayerAttributes attributes) {
}
