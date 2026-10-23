package com.app.api;

import java.util.Map;

import org.springframework.stereotype.Component;

/**
 * Validação dos query params de GET /clubs: apenas o sort, com o padrão name.
 * Parâmetros desconhecidos são ignorados.
 */
@Component
public class ClubListQueryValidator {

    public ClubSort parse(Map<String, String> params) {
        String raw = params == null ? null : params.get("sort");
        if (raw == null) {
            return ClubSort.NAME;
        }
        if (raw.isEmpty()) {
            throw ApiException.badRequest("O parâmetro sort não pode ser vazio.");
        }
        return ClubSort.from(raw)
                .orElseThrow(() -> ApiException.badRequest("O parâmetro sort deve ser name, net_worth_asc ou net_worth_desc."));
    }
}
