package com.app.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.app.model.Position;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class PlayerRequestValidatorTest {

    private final ObjectMapper JSON = new ObjectMapper();
    private final PlayerRequestValidator validator = new PlayerRequestValidator();

    private ObjectNode validBody() {
        ObjectNode body = JSON.createObjectNode();
        body.put("name", "Meia Lua");
        body.put("position", "MEI");
        body.put("agility", 50);
        body.put("age", 25);
        body.put("pace", 68);
        body.put("shooting", 65);
        body.put("passing", 80);
        body.put("dribbling", 78);
        body.put("defending", 52);
        body.put("physical", 60);
        body.put("potential", 85);
        return body;
    }

    private void assertBadRequest(Runnable call) {
        ApiException exception = assertThrows(ApiException.class, call::run);
        assertThat(exception.status()).isEqualTo(400);
    }

    @Test
    void acceptsAValidBody() {
        PlayerRequest request = validator.create(validBody());

        assertThat(request.name()).isEqualTo("Meia Lua");
        assertThat(request.position()).isEqualTo(Position.MEI);
        assertThat(request.age()).isEqualTo(25);
        assertThat(request.attributes().potential()).isEqualTo(85);
    }

    @Test
    void normalizesSpacesInName() {
        ObjectNode body = validBody();
        body.put("name", "  Meia   Lua ");

        assertThat(validator.create(body).name()).isEqualTo("Meia Lua");
    }

    @Test
    @DisplayName("V1 - corpo deve ser objeto JSON")
    void rejectsMissingBody() {
        assertBadRequest(() -> validator.create(null));
    }

    @Test
    void rejectsNonObjectBody() {
        assertBadRequest(() -> validator.create(JSON.createArrayNode()));
    }

    @Test
    void rejectsMissingName() {
        ObjectNode body = validBody();
        body.remove("name");

        assertBadRequest(() -> validator.create(body));
    }

    @Test
    void rejectsNameWithDigit() {
        ObjectNode body = validBody();
        body.put("name", "Meia Lua 7");

        assertBadRequest(() -> validator.create(body));
    }

    @Test
    void rejectsSingleWordName() {
        ObjectNode body = validBody();
        body.put("name", "Meia");

        assertBadRequest(() -> validator.create(body));
    }

    @Test
    void rejectsTooShortName() {
        ObjectNode body = validBody();
        body.put("name", "Ab");

        assertBadRequest(() -> validator.create(body));
    }

    @Test
    void rejectsNameWithControlCharacter() {
        ObjectNode body = validBody();
        body.put("name", "Meia\tLua");

        assertBadRequest(() -> validator.create(body));
    }

    @Test
    void rejectsUnknownPosition() {
        ObjectNode body = validBody();
        body.put("position", "ata");

        assertBadRequest(() -> validator.create(body));
    }

    @Test
    @DisplayName("V2 - numero como texto e recusado")
    void rejectsTextField() {
        ObjectNode body = validBody();
        body.put("agility", "50");

        assertBadRequest(() -> validator.create(body));
    }

    @Test
    void rejectsFractionalInteger() {
        ObjectNode body = validBody();
        body.put("agility", 50.5);

        assertBadRequest(() -> validator.create(body));
    }

    @Test
    void acceptsIntegerWithZeroDecimals() {
        ObjectNode body = validBody();
        body.put("agility", 50.0);

        assertThat(validator.create(body).agility()).isEqualTo(50);
    }

    @Test
    void rejectsAgeBelowMinimum() {
        ObjectNode body = validBody();
        body.put("age", 15);

        assertBadRequest(() -> validator.create(body));
    }

    @Test
    void rejectsAgeAboveMaximum() {
        ObjectNode body = validBody();
        body.put("age", 46);

        assertBadRequest(() -> validator.create(body));
    }

    @Test
    void rejectsHighAgilityForOver34() {
        ObjectNode body = validBody();
        body.put("age", 35);
        body.put("agility", 86);

        assertBadRequest(() -> validator.create(body));
    }

    @Test
    void rejectsAttributeOutOfRange() {
        ObjectNode body = validBody();
        body.put("pace", 100);

        assertBadRequest(() -> validator.create(body));
    }

    @Test
    void rejectsAttributesSumAbove480() {
        ObjectNode body = validBody();
        body.put("pace", 95);
        body.put("shooting", 95);
        body.put("passing", 95);
        body.put("dribbling", 95);
        body.put("defending", 95);
        body.put("physical", 95);
        body.put("potential", 99);

        assertBadRequest(() -> validator.create(body));
    }

    @Test
    void rejectsPotentialBelowMaxAttribute() {
        ObjectNode body = validBody();
        body.put("potential", 79);

        assertBadRequest(() -> validator.create(body));
    }

    @Test
    void rejectsPotentialDifferentFromMaxAttributeForOver33() {
        ObjectNode body = validBody();
        body.put("age", 33);
        body.put("potential", 90);

        assertBadRequest(() -> validator.create(body));
    }

    @Test
    void acceptsPotentialEqualToMaxAttributeForOver33() {
        ObjectNode body = validBody();
        body.put("age", 33);
        body.put("potential", 80);

        assertThat(validator.create(body).attributes().potential()).isEqualTo(80);
    }
}
