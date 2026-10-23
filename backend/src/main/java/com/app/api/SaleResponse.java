package com.app.api;

import java.math.BigDecimal;

import com.app.model.ContractStatus;
import com.app.model.TransactionType;

/**
 * Venda realizada, no formato da transação gravada (RN15, RN16 e RN17).
 */
public record SaleResponse(Integer id, Integer clubId, Integer playerId, String playerName,
        TransactionType type, BigDecimal value, BigDecimal fee, BigDecimal penalty, BigDecimal profit,
        BigDecimal cashChange, String createdAt, BigDecimal purchaseValue, Integer remainingDays,
        Integer penaltyRate, ContractStatus contractStatus, BigDecimal clubCash) {
}
