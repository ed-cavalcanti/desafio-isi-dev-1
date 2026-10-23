package com.app.api;

import java.math.BigDecimal;

/**
 * Totais das transações filtradas do histórico (RN17).
 */
public record TransactionSummary(BigDecimal totalSpent, BigDecimal totalReceived, BigDecimal totalFees,
        BigDecimal totalPenalties, BigDecimal totalProfit) {
}
