package com.app.model;

/**
 * Duelo da partida, numerado de 1 a 6 na ordem da RN20.4.
 */
public record DuelSnapshot(int order, DuelistSnapshot attacker, DuelistSnapshot defender, boolean goal) {
}
