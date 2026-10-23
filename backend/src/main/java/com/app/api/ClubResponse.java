package com.app.api;

import java.math.BigDecimal;

/**
 * Representação do clube nas respostas da API, com o valor do elenco e o
 * patrimônio calculados a cada consulta (RN11).
 */
public record ClubResponse(Integer id, String name, String acronym, BigDecimal cash, BigDecimal squadValue,
        BigDecimal netWorth) {
}
