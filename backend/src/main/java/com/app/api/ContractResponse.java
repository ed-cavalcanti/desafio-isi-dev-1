package com.app.api;

import java.math.BigDecimal;

/**
 * Contrato do jogador no elenco, com o valor de compra, o fim da fidelidade e
 * os valores calculados a cada consulta (RN11 e RN15).
 */
public record ContractResponse(BigDecimal purchaseValue, String loyaltyUntil, Integer remainingDays,
        Integer penaltyRate) {
}
