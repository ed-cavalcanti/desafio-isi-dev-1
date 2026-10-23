package com.app.api;

import java.util.List;

/**
 * Histórico de transações do clube: os registros filtrados e o resumo de totais
 * (RN17).
 */
public record TransactionsResponse(List<TransactionResponse> data, TransactionSummary summary) {
}
