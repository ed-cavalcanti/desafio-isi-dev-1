package com.app.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;

class MatchRequestValidatorTest {

    private final ObjectMapper JSON = new ObjectMapper();
    private final JsonNodeFactory NODES = JsonNodeFactory.instance;
    private final MatchRequestValidator validator = new MatchRequestValidator();

    private ObjectNode body(JsonNode home, JsonNode away) {
        ObjectNode body = JSON.createObjectNode();
        body.set("home_club_id", home);
        body.set("away_club_id", away);
        return body;
    }

    private ObjectNode body(int home, int away) {
        return body(NODES.numberNode(home), NODES.numberNode(away));
    }

    private void assertBadRequest(JsonNode body) {
        ApiException exception = assertThrows(ApiException.class, () -> validator.match(body));
        assertThat(exception.status()).isEqualTo(400);
    }

    @Test
    @DisplayName("aceita os dois clubes inteiros e diferentes")
    void acceptsAValidBody() {
        MatchRequest request = validator.match(body(1, 2));

        assertThat(request.homeClubId()).isEqualTo(1);
        assertThat(request.awayClubId()).isEqualTo(2);
    }

    @Test
    @DisplayName("aceita club_id escrito como decimal com casas zeradas")
    void acceptsClubIdsWithZeroDecimals() {
        assertThat(validator.match(body(NODES.numberNode(1.0), NODES.numberNode(2.0))).homeClubId()).isEqualTo(1);
    }

    @Test
    @DisplayName("recusa corpo que não é objeto e campos ausentes")
    void rejectsInvalidBodies() {
        assertBadRequest(null);
        assertBadRequest(JSON.createArrayNode());
        assertBadRequest(body(null, NODES.numberNode(2)));
        assertBadRequest(body(NODES.numberNode(1), null));
    }

    @Test
    @DisplayName("recusa club_id que não é inteiro positivo")
    void rejectsInvalidClubIds() {
        assertBadRequest(body(NODES.textNode("1"), NODES.numberNode(2)));
        assertBadRequest(body(0, 2));
        assertBadRequest(body(1, -2));
        assertBadRequest(body(NODES.numberNode(1.5), NODES.numberNode(2)));
    }

    @Test
    @DisplayName("recusa mandante igual ao visitante")
    void rejectsSameClub() {
        assertBadRequest(body(3, 3));
    }
}
