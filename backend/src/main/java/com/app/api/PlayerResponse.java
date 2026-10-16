package com.app.api;

import java.math.BigDecimal;

/**
 * Representação do jogador nas respostas da API, com os campos calculados na
 * hora (overall e valor de mercado) e os gravados (valor base, condição e
 * clube).
 */
public record PlayerResponse(Integer id, String name, String position, Integer agility, Integer age,
        String condition, BigDecimal baseValue, BigDecimal marketValue,
        Integer pace, Integer shooting, Integer passing, Integer dribbling,
        Integer defending, Integer physical, Integer potential, Integer overall,
        Integer clubId) {
}
