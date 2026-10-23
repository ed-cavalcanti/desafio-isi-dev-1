package com.app.api;

/**
 * Contrato do jogador no elenco, com o fim da fidelidade e os valores
 * calculados a cada consulta (RN11 e RN15).
 */
public record ContractResponse(String loyaltyUntil, Integer daysRemaining, Integer penaltyPercent) {
}
