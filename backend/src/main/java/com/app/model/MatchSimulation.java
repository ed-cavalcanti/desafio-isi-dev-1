package com.app.model;

import java.util.List;

/**
 * Resultado da simulação da partida: o placar, o resultado e os seis duelos
 * (RN20).
 */
public record MatchSimulation(int homeGoals, int awayGoals, MatchOutcome result, List<DuelSnapshot> duels) {
}
