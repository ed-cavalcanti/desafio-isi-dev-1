package com.app.api;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.app.model.Formation;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * Validação do corpo de PUT /clubs/{id}/lineup: a formação e exatamente cinco
 * ids distintos de jogadores (RN19).
 */
@Component
public class LineupRequestValidator {

    private static final int TITULARES = 5;

    public LineupRequest put(JsonNode body) {
        if (body == null || !body.isObject()) {
            throw ApiException.badRequest("Corpo da requisição deve ser um objeto JSON.");
        }
        Formation formation = formation(body);
        List<Integer> playerIds = playerIds(body);
        return new LineupRequest(formation, playerIds);
    }

    private Formation formation(JsonNode body) {
        JsonNode node = body.get("formation");
        if (node == null || node.isNull() || !node.isTextual()) {
            throw ApiException.badRequest("O campo formation é obrigatório e deve ser um texto.");
        }
        return Formation.from(node.asText()).orElseThrow(
                () -> ApiException.badRequest("O campo formation deve ser 3-1, 2-2, 2-1-1 ou 1-2-1."));
    }

    private List<Integer> playerIds(JsonNode body) {
        JsonNode node = body.get("player_ids");
        if (node == null || node.isNull() || !node.isArray()) {
            throw ApiException.badRequest("O campo player_ids é obrigatório e deve ser uma lista de ids.");
        }
        if (node.size() != TITULARES) {
            throw ApiException.badRequest("O campo player_ids deve ter exatamente 5 ids.");
        }
        List<Integer> playerIds = new ArrayList<>();
        for (JsonNode element : node) {
            playerIds.add(playerId(element));
        }
        Set<Integer> distinct = new HashSet<>(playerIds);
        if (distinct.size() != TITULARES) {
            throw ApiException.badRequest("O campo player_ids não aceita ids repetidos.");
        }
        return List.copyOf(playerIds);
    }

    private Integer playerId(JsonNode node) {
        if (node == null || node.isNull() || !node.isNumber()) {
            throw ApiException.badRequest("Os ids do campo player_ids devem ser números inteiros positivos.");
        }
        BigDecimal value = node.decimalValue();
        if (value.stripTrailingZeros().scale() > 0) {
            throw ApiException.badRequest("Os ids do campo player_ids devem ser números inteiros positivos.");
        }
        try {
            int id = value.intValueExact();
            if (id < 1) {
                throw ApiException.badRequest("Os ids do campo player_ids devem ser números inteiros positivos.");
            }
            return id;
        } catch (ArithmeticException exception) {
            throw ApiException.badRequest("Os ids do campo player_ids estão fora do intervalo permitido.");
        }
    }
}
