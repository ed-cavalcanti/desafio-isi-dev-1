package com.app.api;

import java.math.BigDecimal;

/**
 * Jogador do elenco na consulta do clube: os campos de GET /players/{id} no
 * próprio item e o contrato (RN11).
 */
public record SquadPlayerResponse(Integer id, String name, String position, Integer agility, Integer age,
        String condition, BigDecimal baseValue, BigDecimal marketValue, Integer pace, Integer shooting,
        Integer passing, Integer dribbling, Integer defending, Integer physical, Integer potential,
        Integer overall, Integer clubId, ContractResponse contract) {

    public static SquadPlayerResponse of(PlayerResponse player, ContractResponse contract) {
        return new SquadPlayerResponse(player.id(), player.name(), player.position(), player.agility(), player.age(),
                player.condition(), player.baseValue(), player.marketValue(), player.pace(), player.shooting(),
                player.passing(), player.dribbling(), player.defending(), player.physical(), player.potential(),
                player.overall(), player.clubId(), contract);
    }
}
