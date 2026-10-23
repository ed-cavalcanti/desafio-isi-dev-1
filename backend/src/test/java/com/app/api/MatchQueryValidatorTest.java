package com.app.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.Map;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class MatchQueryValidatorTest {

    private final MatchQueryValidator validator = new MatchQueryValidator();

    private void assertBadRequest(Map<String, String> params) {
        ApiException exception = assertThrows(ApiException.class, () -> validator.parse(params));
        assertThat(exception.status()).isEqualTo(400);
    }

    @Test
    @DisplayName("sem club_id não filtra e ignora parâmetros desconhecidos")
    void usesDefaults() {
        assertThat(validator.parse(Map.of()).clubId()).isNull();
        assertThat(validator.parse(Map.of("foo", "bar")).clubId()).isNull();
    }

    @Test
    @DisplayName("aceita club_id como inteiro positivo")
    void acceptsClubId() {
        assertThat(validator.parse(Map.of("club_id", "5")).clubId()).isEqualTo(5);
    }

    @Test
    @DisplayName("recusa club_id fora do formato de inteiro positivo")
    void rejectsInvalidClubIds() {
        assertBadRequest(Map.of("club_id", ""));
        assertBadRequest(Map.of("club_id", "0"));
        assertBadRequest(Map.of("club_id", "01"));
        assertBadRequest(Map.of("club_id", "-1"));
        assertBadRequest(Map.of("club_id", "1.5"));
        assertBadRequest(Map.of("club_id", "abc"));
    }
}
