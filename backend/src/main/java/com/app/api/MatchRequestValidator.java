package com.app.api;

import java.math.BigDecimal;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * Validação do corpo de POST /matches: os dois clubes, inteiros positivos e
 * diferentes (RN20).
 */
@Component
public class MatchRequestValidator {

    public MatchRequest match(JsonNode body) {
        if (body == null || !body.isObject()) {
            throw ApiException.badRequest("Corpo da requisição deve ser um objeto JSON.");
        }
        Integer homeClubId = clubId(body, "home_club_id");
        Integer awayClubId = clubId(body, "away_club_id");
        if (homeClubId.equals(awayClubId)) {
            throw ApiException.badRequest("Os campos home_club_id e away_club_id devem ser de clubes diferentes.");
        }
        return new MatchRequest(homeClubId, awayClubId);
    }

    private Integer clubId(JsonNode body, String field) {
        JsonNode node = body.get(field);
        if (node == null || node.isNull()) {
            throw ApiException.badRequest("O campo " + field + " é obrigatório.");
        }
        if (!node.isNumber()) {
            throw ApiException.badRequest("O campo " + field + " deve ser um número inteiro.");
        }
        BigDecimal value = node.decimalValue();
        if (value.stripTrailingZeros().scale() > 0) {
            throw ApiException.badRequest("O campo " + field + " deve ser um número inteiro.");
        }
        try {
            int clubId = value.intValueExact();
            if (clubId < 1) {
                throw ApiException.badRequest("O campo " + field + " deve ser um inteiro positivo.");
            }
            return clubId;
        } catch (ArithmeticException exception) {
            throw ApiException.badRequest("O campo " + field + " está fora do intervalo permitido.");
        }
    }
}
