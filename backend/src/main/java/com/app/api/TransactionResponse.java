package com.app.api;

import java.math.BigDecimal;

import com.app.model.TransactionType;

/**
 * Transação do histórico, com os valores e o nome gravados no momento da
 * operação (RN17).
 */
public record TransactionResponse(Integer id, Integer clubId, Integer playerId, String playerName,
        TransactionType type, BigDecimal value, BigDecimal fee, BigDecimal penalty, BigDecimal profit,
        BigDecimal cashChange, String createdAt) {
}
