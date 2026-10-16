package com.app.api;

import java.math.BigDecimal;

import org.springframework.stereotype.Component;

import com.app.model.PlayerAttributes;
import com.app.model.Position;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * Validação do corpo de POST /players
 */
@Component
public class PlayerRequestValidator {

    private static final int NAME_MIN = 3;
    private static final int NAME_MAX = 100;
    private static final int AGILITY_MIN = 1;
    private static final int AGILITY_MAX = 100;
    private static final int AGILITY_MAX_FOR_OVER_34 = 85;
    private static final int AGE_FOR_AGILITY_LIMIT = 35;
    private static final int AGE_MIN = 16;
    private static final int AGE_MAX = 45;
    private static final int ATTRIBUTE_MAX = 99;
    private static final int ATTRIBUTES_SUM_MAX = 480;
    private static final int POTENTIAL_MAX = 99;
    private static final int AGE_FOR_POTENTIAL_EQUAL = 33;

    public PlayerRequest create(JsonNode body) {
        if (body == null || !body.isObject()) {
            throw ApiException.badRequest("Corpo da requisição deve ser um objeto JSON.");
        }
        String name = name(body);
        Position position = position(body);
        Integer agility = integer(body, "agility");
        Integer age = integer(body, "age");
        Integer pace = integer(body, "pace");
        Integer shooting = integer(body, "shooting");
        Integer passing = integer(body, "passing");
        Integer dribbling = integer(body, "dribbling");
        Integer defending = integer(body, "defending");
        Integer physical = integer(body, "physical");
        Integer potential = integer(body, "potential");
        limits(agility, age, pace, shooting, passing, dribbling, defending, physical, potential);
        PlayerAttributes attributes = new PlayerAttributes(pace, shooting, passing, dribbling, defending,
                physical, potential);
        return new PlayerRequest(name, position, agility, age, attributes);
    }

    private String name(JsonNode body) {
        JsonNode node = body.get("name");
        if (node == null || node.isNull() || !node.isTextual()) {
            throw ApiException.badRequest("O campo name é obrigatório e deve ser um texto.");
        }
        String raw = node.asText();
        if (hasControlChar(raw)) {
            throw ApiException.badRequest("O campo name não aceita caracteres de controle.");
        }
        String name = normalizeSpaces(raw);
        int length = name.codePointCount(0, name.length());
        if (length < NAME_MIN || length > NAME_MAX) {
            throw ApiException.badRequest("O campo name deve ter de 3 a 100 caracteres.");
        }
        if (hasDigit(name)) {
            throw ApiException.badRequest("O campo name não aceita dígitos.");
        }
        if (words(name) < 2) {
            throw ApiException.badRequest("O campo name deve ter pelo menos duas palavras.");
        }
        return name;
    }

    private Position position(JsonNode body) {
        JsonNode node = body.get("position");
        if (node == null || node.isNull() || !node.isTextual()) {
            throw ApiException.badRequest("O campo position é obrigatório e deve ser um texto.");
        }
        try {
            return Position.valueOf(node.asText());
        } catch (IllegalArgumentException exception) {
            throw ApiException.badRequest("O campo position deve ser GOL, ZAG, LAT, MEI ou ATA.");
        }
    }

    private Integer integer(JsonNode body, String field) {
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
            return value.intValueExact();
        } catch (ArithmeticException exception) {
            throw ApiException.badRequest("O campo " + field + " está fora do intervalo permitido.");
        }
    }

    private void limits(Integer agility, Integer age, Integer pace, Integer shooting, Integer passing,
            Integer dribbling, Integer defending, Integer physical, Integer potential) {
        if (age < AGE_MIN || age > AGE_MAX) {
            throw ApiException.badRequest("O campo age deve estar entre 16 e 45.");
        }
        if (agility < AGILITY_MIN || agility > AGILITY_MAX) {
            throw ApiException.badRequest("O campo agility deve estar entre 1 e 100.");
        }
        if (age >= AGE_FOR_AGILITY_LIMIT && agility > AGILITY_MAX_FOR_OVER_34) {
            throw ApiException.badRequest("Para jogadores com 35 anos ou mais, o campo agility deve ser no máximo 85.");
        }
        limitAttribute("pace", pace);
        limitAttribute("shooting", shooting);
        limitAttribute("passing", passing);
        limitAttribute("dribbling", dribbling);
        limitAttribute("defending", defending);
        limitAttribute("physical", physical);
        int attributesSum = pace + shooting + passing + dribbling + defending + physical;
        if (attributesSum > ATTRIBUTES_SUM_MAX) {
            throw ApiException.badRequest("A soma dos seis atributos não pode passar de 480.");
        }
        int maxAttribute = Math.max(Math.max(Math.max(pace, shooting), Math.max(passing, dribbling)),
                Math.max(defending, physical));
        if (potential < 1 || potential > POTENTIAL_MAX) {
            throw ApiException.badRequest("O campo potential deve estar entre 1 e 99.");
        }
        if (potential < maxAttribute) {
            throw ApiException.badRequest("O campo potential deve ser maior ou igual ao maior dos seis atributos.");
        }
        if (age >= AGE_FOR_POTENTIAL_EQUAL && potential != maxAttribute) {
            throw ApiException.badRequest(
                    "Para jogadores com 33 anos ou mais, o campo potential deve ser igual ao maior dos seis atributos.");
        }
    }

    private void limitAttribute(String field, Integer value) {
        if (value < 1 || value > ATTRIBUTE_MAX) {
            throw ApiException.badRequest("O campo " + field + " deve estar entre 1 e 99.");
        }
    }

    private String normalizeSpaces(String raw) {
        return raw.replaceAll(" +", " ").trim();
    }

    private boolean hasControlChar(String value) {
        return value.codePoints().anyMatch(Character::isISOControl);
    }

    private boolean hasDigit(String value) {
        return value.codePoints().anyMatch(codePoint -> codePoint >= '0' && codePoint <= '9');
    }

    private int words(String value) {
        int count = 0;
        for (String part : value.split(" ", -1)) {
            if (part.codePoints().anyMatch(Character::isLetter)) {
                count++;
            }
        }
        return count;
    }
}
