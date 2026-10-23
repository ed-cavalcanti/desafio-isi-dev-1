package com.app.api;

import java.math.BigDecimal;

/**
 * Compra realizada nas respostas da API: o valor pago, a taxa, o custo total, o
 * contrato criado e o novo caixa (RN12 e RN13).
 */
public record PurchaseResponse(Integer playerId, Integer clubId, BigDecimal value, BigDecimal fee,
        BigDecimal totalCost, String loyaltyUntil, BigDecimal cash) {
}
