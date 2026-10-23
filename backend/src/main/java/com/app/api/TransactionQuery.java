package com.app.api;

import java.util.Set;

import com.app.model.TransactionType;

/**
 * Filtros aceitos por GET /clubs/{id}/transactions e pela exportação (RN17 e
 * RN18): os tipos e o jogador, ambos opcionais.
 */
public record TransactionQuery(Set<TransactionType> types, Integer playerId) {
}
