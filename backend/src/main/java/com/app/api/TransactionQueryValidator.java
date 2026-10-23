package com.app.api;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.app.model.TransactionType;

/**
 * Validação dos query params de GET /clubs/{id}/transactions e da exportação:
 * type com os tipos separados por vírgula, sem espaços e sem repetição, e
 * player_id como inteiro positivo. Parâmetros desconhecidos são ignorados.
 */
@Component
public class TransactionQueryValidator {

    public TransactionQuery parse(Map<String, String> params) {
        Map<String, String> values = params == null ? Map.of() : params;
        Set<TransactionType> types = types(values.get("type"));
        Integer playerId = playerId(values.get("player_id"));
        return new TransactionQuery(types, playerId);
    }

    private Set<TransactionType> types(String raw) {
        if (raw == null) {
            return null;
        }
        if (raw.isEmpty()) {
            throw ApiException.badRequest("O parâmetro type não pode ser vazio.");
        }
        Set<TransactionType> types = EnumSet.noneOf(TransactionType.class);
        for (String token : raw.split(",", -1)) {
            TransactionType type;
            try {
                type = TransactionType.valueOf(token);
            } catch (IllegalArgumentException exception) {
                throw ApiException.badRequest("O parâmetro type deve ser COMPRA e/ou VENDA.");
            }
            if (!types.add(type)) {
                throw ApiException.badRequest("O parâmetro type não pode repetir o mesmo tipo.");
            }
        }
        return types;
    }

    private Integer playerId(String raw) {
        if (raw == null) {
            return null;
        }
        if (raw.isEmpty() || (raw.length() > 1 && raw.charAt(0) == '0') || !hasOnlyDigits(raw)) {
            throw ApiException.badRequest("O parâmetro player_id deve ser um inteiro positivo.");
        }
        try {
            int playerId = Integer.parseInt(raw);
            if (playerId < 1) {
                throw ApiException.badRequest("O parâmetro player_id deve ser um inteiro positivo.");
            }
            return playerId;
        } catch (NumberFormatException exception) {
            throw ApiException.badRequest("O parâmetro player_id deve ser um inteiro positivo.");
        }
    }

    private boolean hasOnlyDigits(String value) {
        return value.codePoints().allMatch(codePoint -> codePoint >= '0' && codePoint <= '9');
    }
}
