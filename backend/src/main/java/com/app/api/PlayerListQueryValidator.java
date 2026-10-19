package com.app.api;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

import com.app.model.Condition;
import com.app.model.Position;

/**
 * Validação dos query params de GET /players. Parâmetros desconhecidos são
 * ignorados; parâmetros conhecidos com valor vazio são recusados com 400.
 */
@Component
public class PlayerListQueryValidator {

    private static final int DEFAULT_PAGE = 1;
    private static final int DEFAULT_LIMIT = 10;
    private static final int LIMIT_MAX = 50;
    private static final int AGE_MIN = 16;
    private static final int AGE_MAX = 45;
    private static final BigDecimal VALUE_MIN = BigDecimal.ZERO;
    private static final BigDecimal VALUE_MAX = new BigDecimal("550");
    private static final int SEARCH_MIN = 2;
    private static final int SEARCH_MAX = 100;
    private static final int SORT_MAX_CRITERIA = 2;
    private static final Pattern DECIMAL = Pattern.compile("(0|[1-9][0-9]*)(\\.[0-9]{1,2})?");

    public PlayerListQuery parse(Map<String, String> params) {
        Map<String, String> values = params == null ? Map.of() : params;
        String search = search(values.get("search"));
        Position position = position(values.get("position"));
        Condition condition = condition(values.get("condition"));
        Boolean free = free(values.get("free"));
        Integer clubId = integer("club_id", values.get("club_id"), 1, Integer.MAX_VALUE);
        Integer minAge = integer("min_age", values.get("min_age"), AGE_MIN, AGE_MAX);
        Integer maxAge = integer("max_age", values.get("max_age"), AGE_MIN, AGE_MAX);
        int effectiveMinAge = minAge == null ? AGE_MIN : minAge;
        int effectiveMaxAge = maxAge == null ? AGE_MAX : maxAge;
        if (effectiveMinAge > effectiveMaxAge) {
            throw ApiException.badRequest("O parâmetro min_age não pode ser maior que max_age.");
        }
        BigDecimal minValue = decimal("min_value", values.get("min_value"));
        BigDecimal maxValue = decimal("max_value", values.get("max_value"));
        BigDecimal effectiveMinValue = minValue == null ? VALUE_MIN : minValue;
        BigDecimal effectiveMaxValue = maxValue == null ? VALUE_MAX : maxValue;
        if (effectiveMinValue.compareTo(effectiveMaxValue) > 0) {
            throw ApiException.badRequest("O parâmetro min_value não pode ser maior que max_value.");
        }
        List<PlayerSort> sort = sort(values.get("sort"));
        Integer page = integer("page", values.get("page"), 1, Integer.MAX_VALUE);
        Integer limit = integer("limit", values.get("limit"), 1, LIMIT_MAX);
        if (Boolean.TRUE.equals(free) && clubId != null) {
            throw ApiException.badRequest("O filtro free=true não pode ser combinado com club_id.");
        }
        return new PlayerListQuery(search, position, condition, free, clubId, effectiveMinAge, effectiveMaxAge,
                effectiveMinValue, effectiveMaxValue, sort, page == null ? DEFAULT_PAGE : page,
                limit == null ? DEFAULT_LIMIT : limit);
    }

    private String search(String raw) {
        if (raw == null) {
            return null;
        }
        if (raw.codePoints().anyMatch(Character::isISOControl)) {
            throw ApiException.badRequest("O parâmetro search não aceita caracteres de controle.");
        }
        String search = raw.replaceAll(" +", " ").trim();
        int length = search.codePointCount(0, search.length());
        if (length < SEARCH_MIN || length > SEARCH_MAX) {
            throw ApiException.badRequest("O parâmetro search deve ter de 2 a 100 caracteres.");
        }
        return search;
    }

    private Position position(String raw) {
        if (raw == null) {
            return null;
        }
        try {
            return Position.valueOf(requireValue("position", raw));
        } catch (IllegalArgumentException exception) {
            throw ApiException.badRequest("O parâmetro position deve ser GOL, ZAG, LAT, MEI ou ATA.");
        }
    }

    private Condition condition(String raw) {
        if (raw == null) {
            return null;
        }
        try {
            return Condition.valueOf(requireValue("condition", raw));
        } catch (IllegalArgumentException exception) {
            throw ApiException.badRequest(
                    "O parâmetro condition deve ser APTO, MAL_CONDICIONADO ou DOENTE.");
        }
    }

    private Boolean free(String raw) {
        if (raw == null) {
            return null;
        }
        return switch (requireValue("free", raw)) {
            case "true" -> Boolean.TRUE;
            case "false" -> Boolean.FALSE;
            default -> throw ApiException.badRequest("O parâmetro free deve ser true ou false.");
        };
    }

    private Integer integer(String parameter, String raw, int min, int max) {
        if (raw == null) {
            return null;
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
        if (value < min || value > max) {
            throw ApiException.badRequest("O parâmetro " + parameter + " está fora do intervalo permitido.");
        }
        return value;
    }

    private BigDecimal decimal(String parameter, String raw) {
        if (raw == null) {
            return null;
        }
        if (!DECIMAL.matcher(raw).matches()) {
            throw ApiException.badRequest(
                    "O parâmetro " + parameter + " deve ser um decimal de 0 a 550 com até 2 casas.");
        }
        BigDecimal value = new BigDecimal(raw);
        if (value.compareTo(VALUE_MIN) < 0 || value.compareTo(VALUE_MAX) > 0) {
            throw ApiException.badRequest("O parâmetro " + parameter + " deve estar entre 0 e 550.");
        }
        return value;
    }

    private List<PlayerSort> sort(String raw) {
        if (raw == null) {
            return List.of(PlayerSort.NAME);
        }
        String[] tokens = requireValue("sort", raw).split(",", -1);
        if (tokens.length > SORT_MAX_CRITERIA) {
            throw ApiException.badRequest("O parâmetro sort aceita no máximo dois critérios.");
        }
        Set<PlayerSort.Field> fields = EnumSet.noneOf(PlayerSort.Field.class);
        List<PlayerSort> sort = new ArrayList<>();
        for (String token : tokens) {
            PlayerSort criterion = PlayerSort.from(token)
                    .orElseThrow(() -> ApiException.badRequest("O parâmetro sort contém um critério inválido."));
            if (!fields.add(criterion.field())) {
                throw ApiException.badRequest("O parâmetro sort não pode repetir o mesmo campo.");
            }
            sort.add(criterion);
        }
        return List.copyOf(sort);
    }

    private String requireValue(String parameter, String raw) {
        if (raw.isEmpty()) {
            throw ApiException.badRequest("O parâmetro " + parameter + " não pode ser vazio.");
        }
        return raw;
    }

    private boolean hasOnlyDigits(String value) {
        return value.codePoints().allMatch(codePoint -> codePoint >= '0' && codePoint <= '9');
    }
}
