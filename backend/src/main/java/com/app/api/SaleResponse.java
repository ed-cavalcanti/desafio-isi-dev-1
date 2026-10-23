package com.app.api;

import java.math.BigDecimal;

/**
 * Venda realizada nas respostas da API: valor de compra, valor de venda, dias
 * restantes, multa, lucro, comissão, crédito e novo caixa (RN15 e RN16).
 */
public record SaleResponse(Integer playerId, Integer clubId, BigDecimal purchaseValue, BigDecimal saleValue,
        Integer daysRemaining, Integer penaltyPercent, BigDecimal penalty, BigDecimal profit,
        BigDecimal commission, BigDecimal credit, BigDecimal cash) {
}
