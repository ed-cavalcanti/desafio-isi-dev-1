package com.app.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.app.model.BrasiliaTime;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;

class PurchaseRequestValidatorTest {

    private final ObjectMapper JSON = new ObjectMapper();
    private final JsonNodeFactory NODES = JsonNodeFactory.instance;
    private final PurchaseRequestValidator validator = new PurchaseRequestValidator();

    private String date(LocalDateTime time) {
        return time.format(DateTimeFormatter.ofPattern("uuuu-MM-dd'T'HH:mm")) + "-03:00";
    }

    private ObjectNode body(JsonNode clubId, String loyaltyUntil) {
        ObjectNode body = JSON.createObjectNode();
        body.set("club_id", clubId);
        if (loyaltyUntil != null) {
            body.put("loyalty_until", loyaltyUntil);
        }
        return body;
    }

    private ObjectNode body(int clubId, String loyaltyUntil) {
        return body(NODES.numberNode(clubId), loyaltyUntil);
    }

    private void assertBadRequest(JsonNode body) {
        ApiException exception = assertThrows(ApiException.class, () -> validator.purchase(body));
        assertThat(exception.status()).isEqualTo(400);
    }

    @Test
    @DisplayName("aceita um corpo válido com data e hora futura no formato da RN01")
    void acceptsAValidBody() {
        PurchaseRequest request = validator.purchase(body(2, date(BrasiliaTime.now().plusDays(10))));

        assertThat(request.clubId()).isEqualTo(2);
        assertThat(request.loyaltyUntil()).isAfter(BrasiliaTime.now());
    }

    @Test
    @DisplayName("aceita club_id escrito como decimal com casas zeradas")
    void acceptsClubIdWithZeroDecimals() {
        assertThat(validator.purchase(body(NODES.numberNode(2.0), date(BrasiliaTime.now().plusDays(1)))).clubId())
                .isEqualTo(2);
    }

    @Test
    @DisplayName("recusa corpo que não é objeto e campos ausentes")
    void rejectsInvalidBodies() {
        assertBadRequest(null);
        assertBadRequest(JSON.createArrayNode());
        assertBadRequest(body(null, date(BrasiliaTime.now().plusDays(1))));
        assertBadRequest(body(2, null));
    }

    @Test
    @DisplayName("recusa club_id que não é inteiro positivo")
    void rejectsInvalidClubIds() {
        assertBadRequest(body(NODES.textNode("2"), date(BrasiliaTime.now().plusDays(1))));
        assertBadRequest(body(0, date(BrasiliaTime.now().plusDays(1))));
        assertBadRequest(body(-1, date(BrasiliaTime.now().plusDays(1))));
        assertBadRequest(body(NODES.numberNode(1.5), date(BrasiliaTime.now().plusDays(1))));
    }

    @Test
    @DisplayName("recusa loyalty_until fora do formato da RN01 ou com data inexistente")
    void rejectsInvalidDateFormats() {
        String future = date(BrasiliaTime.now().plusDays(10));
        assertBadRequest(body(2, future.replace("-03:00", "")));
        assertBadRequest(body(2, future.replace("-03:00", "Z")));
        assertBadRequest(body(2, "2027-03-02T10:15:00-03:00"));
        assertBadRequest(body(2, "02/03/2027 10:15"));
        assertBadRequest(body(2, "2027-02-30T10:15-03:00"));
        assertBadRequest(body(2, "2027-03-02T24:00-03:00"));
    }

    @Test
    @DisplayName("recusa loyalty_until no passado ou além de 1.095 dias")
    void rejectsDatesOutOfAllowedRange() {
        assertBadRequest(body(2, date(BrasiliaTime.now().minusDays(1))));
        assertBadRequest(body(2, date(BrasiliaTime.now().plusDays(1096))));
        assertThat(validator.purchase(body(2, date(BrasiliaTime.now().plusDays(1095)))).clubId()).isEqualTo(2);
    }
}
