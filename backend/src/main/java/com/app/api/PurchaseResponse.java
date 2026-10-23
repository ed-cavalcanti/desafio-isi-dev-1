package com.app.api;

import java.math.BigDecimal;

import com.app.model.TransactionType;

/**
 * Compra realizada, no formato da transação gravada (RN12, RN13 e RN17).
 */
public record PurchaseResponse(Integer id, Integer clubId, Integer playerId, String playerName,
        TransactionType type, BigDecimal value, BigDecimal fee, BigDecimal penalty, BigDecimal profit,
        BigDecimal cashChange, String createdAt, ContractCreatedResponse contract, BigDecimal clubCash,
        BigDecimal totalCost) {
}
