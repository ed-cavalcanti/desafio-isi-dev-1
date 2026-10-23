package com.app.api;

import java.util.Map;

import org.springframework.stereotype.Component;

/**
 * Validação dos query params de GET /matches: apenas o club_id, como inteiro
 * positivo. Parâmetros desconhecidos são ignorados.
 */
@Component
public class MatchQueryValidator {

    public MatchQuery parse(Map<String, String> params) {
        String raw = params == null ? null : params.get("club_id");
        if (raw == null) {
            return new MatchQuery(null);
        }
        if (raw.isEmpty() || (raw.length() > 1 && raw.charAt(0) == '0') || !hasOnlyDigits(raw)) {
            throw ApiException.badRequest("O parâmetro club_id deve ser um inteiro positivo.");
        }
        try {
            int clubId = Integer.parseInt(raw);
            if (clubId < 1) {
                throw ApiException.badRequest("O parâmetro club_id deve ser um inteiro positivo.");
            }
            return new MatchQuery(clubId);
        } catch (NumberFormatException exception) {
            throw ApiException.badRequest("O parâmetro club_id deve ser um inteiro positivo.");
        }
    }

    private boolean hasOnlyDigits(String value) {
        return value.codePoints().allMatch(codePoint -> codePoint >= '0' && codePoint <= '9');
    }
}
