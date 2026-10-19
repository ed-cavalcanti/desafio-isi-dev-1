package com.app.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class PlayerListQueryValidatorTest {

    private final PlayerListQueryValidator validator = new PlayerListQueryValidator();

    private void assertBadRequest(String page, String limit) {
        ApiException exception = assertThrows(ApiException.class, () -> validator.parse(page, limit));
        assertThat(exception.status()).isEqualTo(400);
    }

    @Test
    void usesDefaultsWhenParametersAreAbsent() {
        PlayerListQuery query = validator.parse(null, null);

        assertThat(query.page()).isEqualTo(1);
        assertThat(query.limit()).isEqualTo(10);
    }

    @Test
    void acceptsLimitAtTheBoundaries() {
        assertThat(validator.parse("2", "50").limit()).isEqualTo(50);
        assertThat(validator.parse("1", "1").limit()).isEqualTo(1);
    }

    @Test
    @DisplayName("rejeita pagina e limite fora do formato de inteiro positivo")
    void rejectsInvalidIntegers() {
        assertBadRequest("0", null);
        assertBadRequest("-1", null);
        assertBadRequest("1.5", null);
        assertBadRequest("01", null);
        assertBadRequest("abc", null);
        assertBadRequest(null, "0");
        assertBadRequest(null, "51");
        assertBadRequest("", null);
        assertBadRequest(null, "");
    }

    @Test
    void rejectsPageAboveIntegerRange() {
        assertBadRequest("2147483648", null);
    }
}
