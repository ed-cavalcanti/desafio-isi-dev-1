package com.app.api;

import java.math.BigDecimal;

/**
 * Contrato do jogador no elenco, com o fim da fidelidade, o valor de compra e
 * os valores calculados a cada consulta (RN11 e RN15).
 */
public record ContractResponse(String loyaltyUntil, Integer daysRemaining, Integer penaltyPercent,
        BigDecimal purchaseValue) {
}
