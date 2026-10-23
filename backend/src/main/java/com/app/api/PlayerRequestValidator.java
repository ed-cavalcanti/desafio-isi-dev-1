package com.app.api;

import java.math.BigDecimal;

import org.springframework.stereotype.Component;

import com.app.model.Condition;
import com.app.model.NameText;
import com.app.model.PlayerAttributes;
import com.app.model.Position;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * Validação do corpo dos endpoints de jogador: cadastro, edição (PUT) e
 * alteração de condição (PATCH).
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
        requireObject(body);
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
        ageAndAgility(agility, age);
        PlayerAttributes attributes = new PlayerAttributes(pace, shooting, passing, dribbling, defending,
                physical, potential);
        attributeLimits(age, attributes);
        return new PlayerRequest(name, position, agility, age, attributes);
    }

    /**
     * PUT /players/{id}: só nome, posição, agilidade e idade; os indicadores e o
     * potencial enviados são ignorados (V7).
     */
    public PlayerUpdateRequest update(JsonNode body) {
        requireObject(body);
        String name = name(body);
        Position position = position(body);
        Integer agility = integer(body, "agility");
        Integer age = integer(body, "age");
        ageAndAgility(agility, age);
        return new PlayerUpdateRequest(name, position, agility, age);
    }

    /**
     * PATCH /players/{id}/condition: apenas a condição; os demais campos são
     * ignorados (V7).
     */
    public Condition condition(JsonNode body) {
        requireObject(body);
        JsonNode node = body.get("condition");
        if (node == null || node.isNull() || !node.isTextual()) {
            throw ApiException.badRequest("O campo condition é obrigatório e deve ser um texto.");
        }
        try {
            return Condition.valueOf(node.asText());
        } catch (IllegalArgumentException exception) {
            throw ApiException.badRequest("O campo condition deve ser APTO, MAL_CONDICIONADO ou DOENTE.");
        }
    }

    private void requireObject(JsonNode body) {
        if (body == null || !body.isObject()) {
            throw ApiException.badRequest("Corpo da requisição deve ser um objeto JSON.");
        }
    }

    private String name(JsonNode body) {
        JsonNode node = body.get("name");
        if (node == null || node.isNull() || !node.isTextual()) {
            throw ApiException.badRequest("O campo name é obrigatório e deve ser um texto.");
        }
        String raw = node.asText();
        if (NameText.hasControlChar(raw)) {
            throw ApiException.badRequest("O campo name não aceita caracteres de controle.");
        }
        String name = NameText.normalize(raw);
        int length = NameText.length(name);
        if (length < NAME_MIN || length > NAME_MAX) {
            throw ApiException.badRequest("O campo name deve ter de 3 a 100 caracteres.");
        }
        if (NameText.hasDigit(name)) {
            throw ApiException.badRequest("O campo name não aceita dígitos.");
        }
        if (NameText.words(name) < 2) {
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

    private void ageAndAgility(Integer agility, Integer age) {
        if (age < AGE_MIN || age > AGE_MAX) {
            throw ApiException.badRequest("O campo age deve estar entre 16 e 45.");
        }
        if (agility < AGILITY_MIN || agility > AGILITY_MAX) {
            throw ApiException.badRequest("O campo agility deve estar entre 1 e 100.");
        }
        if (age >= AGE_FOR_AGILITY_LIMIT && agility > AGILITY_MAX_FOR_OVER_34) {
            throw ApiException.badRequest("Para jogadores com 35 anos ou mais, o campo agility deve ser no máximo 85.");
        }
    }

    private void attributeLimits(Integer age, PlayerAttributes attributes) {
        limitAttribute("pace", attributes.pace());
        limitAttribute("shooting", attributes.shooting());
        limitAttribute("passing", attributes.passing());
        limitAttribute("dribbling", attributes.dribbling());
        limitAttribute("defending", attributes.defending());
        limitAttribute("physical", attributes.physical());
        int attributesSum = attributes.pace() + attributes.shooting() + attributes.passing()
                + attributes.dribbling() + attributes.defending() + attributes.physical();
        if (attributesSum > ATTRIBUTES_SUM_MAX) {
            throw ApiException.badRequest("A soma dos seis atributos não pode passar de 480.");
        }
        int maxAttribute = Math.max(Math.max(Math.max(attributes.pace(), attributes.shooting()),
                Math.max(attributes.passing(), attributes.dribbling())),
                Math.max(attributes.defending(), attributes.physical()));
        if (attributes.potential() < 1 || attributes.potential() > POTENTIAL_MAX) {
            throw ApiException.badRequest("O campo potential deve estar entre 1 e 99.");
        }
        if (attributes.potential() < maxAttribute) {
            throw ApiException.badRequest("O campo potential deve ser maior ou igual ao maior dos seis atributos.");
        }
        if (age >= AGE_FOR_POTENTIAL_EQUAL && attributes.potential() != maxAttribute) {
            throw ApiException.badRequest(
                    "Para jogadores com 33 anos ou mais, o campo potential deve ser igual ao maior dos seis atributos.");
        }
    }

    private void limitAttribute(String field, Integer value) {
        if (value < 1 || value > ATTRIBUTE_MAX) {
            throw ApiException.badRequest("O campo " + field + " deve estar entre 1 e 99.");
        }
    }
}
