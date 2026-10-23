package com.app.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.app.model.Formation;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

class LineupRequestValidatorTest {

    private final ObjectMapper JSON = new ObjectMapper();
    private final LineupRequestValidator validator = new LineupRequestValidator();

    private ArrayNode ids(int... values) {
        ArrayNode ids = JSON.createArrayNode();
        for (int value : values) {
            ids.add(value);
        }
        return ids;
    }

    private ObjectNode body(String formation, JsonNode playerIds) {
        ObjectNode body = JSON.createObjectNode();
        body.put("formation", formation);
        body.set("player_ids", playerIds);
        return body;
    }

    private void assertBadRequest(JsonNode body) {
        ApiException exception = assertThrows(ApiException.class, () -> validator.put(body));
        assertThat(exception.status()).isEqualTo(400);
    }

    @Test
    @DisplayName("aceita a formação e os cinco ids na ordem enviada")
    void acceptsAValidBody() {
        LineupRequest request = validator.put(body("2-1-1", ids(5, 1, 2, 3, 4)));

        assertThat(request.formation()).isEqualTo(Formation.TWO_ONE_ONE);
        assertThat(request.playerIds()).containsExactly(5, 1, 2, 3, 4);
    }

    @Test
    @DisplayName("recusa corpo que não é objeto e campos ausentes")
    void rejectsInvalidBodies() {
        assertBadRequest(null);
        assertBadRequest(JSON.createArrayNode());
        assertBadRequest(JSON.createObjectNode().put("formation", "2-1-1"));
        assertBadRequest(JSON.createObjectNode().set("player_ids", ids(1, 2, 3, 4, 5)));
    }

    @Test
    @DisplayName("recusa formação fora das quatro aceitas")
    void rejectsUnknownFormation() {
        assertBadRequest(body("211", ids(1, 2, 3, 4, 5)));
        assertBadRequest(body("4-0", ids(1, 2, 3, 4, 5)));
        assertBadRequest(body("2-1-1 ", ids(1, 2, 3, 4, 5)));
    }

    @Test
    @DisplayName("recusa player_ids sem exatamente cinco ids distintos")
    void rejectsWrongNumberOfPlayers() {
        assertBadRequest(body("2-1-1", ids(1, 2, 3, 4)));
        assertBadRequest(body("2-1-1", ids(1, 2, 3, 4, 5, 6)));
        assertBadRequest(body("2-1-1", ids(1, 2, 3, 4, 4)));
    }

    @Test
    @DisplayName("recusa ids que não são inteiros positivos")
    void rejectsInvalidIds() {
        ObjectNode textId = body("2-1-1", JSON.createArrayNode());
        textId.withArray("player_ids").add("5");
        assertBadRequest(textId);

        ObjectNode fractional = body("2-1-1", JSON.createArrayNode());
        fractional.withArray("player_ids").add(1.5);
        fractional.withArray("player_ids").addAll(ids(2, 3, 4, 5));
        assertBadRequest(fractional);

        assertBadRequest(body("2-1-1", ids(1, 2, 3, 4, 0)));
        assertBadRequest(body("2-1-1", ids(1, 2, 3, 4, -5)));

        ObjectNode notArray = JSON.createObjectNode();
        notArray.put("formation", "2-1-1");
        notArray.put("player_ids", "1,2,3,4,5");
        assertBadRequest(notArray);
    }

    @Test
    @DisplayName("aceita ids escritos com casas decimais zeradas")
    void acceptsIntegerIdsWrittenAsDecimals() {
        ObjectNode body = body("3-1", JSON.createArrayNode());
        body.withArray("player_ids").add(5.0);
        body.withArray("player_ids").addAll(ids(1, 2, 3, 4));

        assertThat(validator.put(body).playerIds()).containsExactly(5, 1, 2, 3, 4);
    }
}
