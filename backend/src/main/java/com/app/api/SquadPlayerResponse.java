package com.app.api;

/**
 * Jogador do elenco na consulta do clube, com os campos de GET /players/{id} e
 * o contrato (RN11).
 */
public record SquadPlayerResponse(PlayerResponse player, ContractResponse contract) {
}
