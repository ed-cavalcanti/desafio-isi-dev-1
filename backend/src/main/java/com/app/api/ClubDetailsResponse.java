package com.app.api;

import java.math.BigDecimal;
import java.util.List;

/**
 * Consulta do clube com o elenco na ordem da RN11, o contrato de cada jogador e
 * o valor do elenco e o patrimônio calculados a cada consulta.
 */
public record ClubDetailsResponse(Integer id, String name, String acronym, BigDecimal cash, BigDecimal squadValue,
        BigDecimal netWorth, List<SquadPlayerResponse> players) {
}
