package com.app.api;

import org.springframework.stereotype.Component;

/**
 * Validação dos query params de paginação de GET /players.
 */
@Component
public class PlayerListQueryValidator {

    private static final int DEFAULT_PAGE = 1;
    private static final int DEFAULT_LIMIT = 10;
    private static final int LIMIT_MAX = 50;

    public PlayerListQuery parse(String page, String limit) {
        return new PlayerListQuery(
                positiveInteger("page", page, DEFAULT_PAGE, Integer.MAX_VALUE),
                positiveInteger("limit", limit, DEFAULT_LIMIT, LIMIT_MAX));
    }

    private int positiveInteger(String parameter, String raw, int defaultValue, int max) {
        if (raw == null) {
            return defaultValue;
        }
        if (raw.isEmpty() || !hasOnlyDigits(raw) || (raw.length() > 1 && raw.charAt(0) == '0')) {
            throw ApiException.badRequest("O parâmetro " + parameter + " deve ser um inteiro positivo.");
        }
        int value;
        try {
            value = Integer.parseInt(raw);
        } catch (NumberFormatException exception) {
            throw ApiException.badRequest("O parâmetro " + parameter + " deve ser um inteiro positivo.");
        }
        if (value < 1 || value > max) {
            throw ApiException.badRequest("O parâmetro " + parameter + " está fora do intervalo permitido.");
        }
        return value;
    }

    private boolean hasOnlyDigits(String value) {
        return value.codePoints().allMatch(codePoint -> codePoint >= '0' && codePoint <= '9');
    }
}
