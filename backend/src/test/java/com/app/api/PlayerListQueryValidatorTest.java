package com.app.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class PlayerListQueryValidatorTest {

    private final PlayerListQueryValidator validator = new PlayerListQueryValidator();

    private void assertBadRequest(Map<String, String> params) {
        ApiException exception = assertThrows(ApiException.class, () -> validator.parse(params));
        assertThat(exception.status()).isEqualTo(400);
    }

    @Test
    void usesDefaultsWhenParametersAreAbsent() {
        PlayerListQuery query = validator.parse(Map.of());

        assertThat(query.search()).isNull();
        assertThat(query.position()).isNull();
        assertThat(query.condition()).isNull();
        assertThat(query.free()).isNull();
        assertThat(query.clubId()).isNull();
        assertThat(query.minAge()).isEqualTo(16);
        assertThat(query.maxAge()).isEqualTo(45);
        assertThat(query.minValue()).isEqualByComparingTo("0");
        assertThat(query.maxValue()).isEqualByComparingTo("550");
        assertThat(query.sort()).containsExactly(PlayerSort.NAME);
        assertThat(query.page()).isEqualTo(1);
        assertThat(query.limit()).isEqualTo(10);
    }

    @Test
    void acceptsAndNormalizesEveryParameter() {
        PlayerListQuery query = validator.parse(Map.ofEntries(
                Map.entry("search", "  Joao   Silva "),
                Map.entry("position", "MEI"),
                Map.entry("condition", "MAL_CONDICIONADO"),
                Map.entry("club_id", "25"),
                Map.entry("min_age", "16"),
                Map.entry("max_age", "45"),
                Map.entry("min_value", "0.5"),
                Map.entry("max_value", "550.00"),
                Map.entry("sort", "value_desc,age_asc"),
                Map.entry("page", "3"),
                Map.entry("limit", "50")));

        assertThat(query.search()).isEqualTo("Joao Silva");
        assertThat(query.position()).isEqualTo(com.app.model.Position.MEI);
        assertThat(query.condition()).isEqualTo(com.app.model.Condition.MAL_CONDICIONADO);
        assertThat(query.clubId()).isEqualTo(25);
        assertThat(query.minValue()).isEqualByComparingTo("0.5");
        assertThat(query.sort()).containsExactly(PlayerSort.VALUE_DESC, PlayerSort.AGE_ASC);
        assertThat(query.page()).isEqualTo(3);
        assertThat(query.limit()).isEqualTo(50);
    }

    @Test
    void acceptsFreeFalseWithClubId() {
        PlayerListQuery query = validator.parse(Map.of("free", "false", "club_id", "1"));

        assertThat(query.free()).isFalse();
        assertThat(query.clubId()).isEqualTo(1);
    }

    @Test
    @DisplayName("rejeita inteiros com sinal, fracao, zeros a esquerda ou fora da faixa")
    void rejectsInvalidIntegers() {
        assertBadRequest(Map.of("page", "0"));
        assertBadRequest(Map.of("page", "-1"));
        assertBadRequest(Map.of("page", "01"));
        assertBadRequest(Map.of("page", "1.5"));
        assertBadRequest(Map.of("page", ""));
        assertBadRequest(Map.of("limit", "51"));
        assertBadRequest(Map.of("limit", "0"));
        assertBadRequest(Map.of("club_id", "0"));
        assertBadRequest(Map.of("min_age", "15"));
        assertBadRequest(Map.of("max_age", "46"));
        assertBadRequest(Map.of("page", "2147483648"));
    }

    @Test
    @DisplayName("aceita decimais apenas na forma com ate 2 casas e entre 0 e 550")
    void validatesDecimals() {
        assertThat(validator.parse(Map.of("min_value", "10")).minValue())
                .isEqualByComparingTo("10");
        assertThat(validator.parse(Map.of("min_value", "10.5")).minValue())
                .isEqualByComparingTo("10.5");
        assertThat(validator.parse(Map.of("max_value", "10.55")).maxValue())
                .isEqualByComparingTo("10.55");
        assertThat(validator.parse(Map.of("min_value", "0.5")).minValue())
                .isEqualByComparingTo("0.5");

        assertBadRequest(Map.of("min_value", ".5"));
        assertBadRequest(Map.of("min_value", "10."));
        assertBadRequest(Map.of("min_value", "01.0"));
        assertBadRequest(Map.of("min_value", "-1"));
        assertBadRequest(Map.of("min_value", "10.555"));
        assertBadRequest(Map.of("min_value", "1e2"));
        assertBadRequest(Map.of("max_value", "551"));
    }

    @Test
    void rejectsContradictoryRangesAndFreeWithClub() {
        assertBadRequest(Map.of("min_age", "30", "max_age", "20"));
        assertBadRequest(Map.of("min_value", "10", "max_value", "5"));
        assertBadRequest(Map.of("free", "true", "club_id", "1"));
    }

    @Test
    void rejectsInvalidEnumsAndFree() {
        assertBadRequest(Map.of("position", "mei"));
        assertBadRequest(Map.of("position", ""));
        assertBadRequest(Map.of("condition", "apto"));
        assertBadRequest(Map.of("condition", ""));
        assertBadRequest(Map.of("free", "TRUE"));
        assertBadRequest(Map.of("free", ""));
    }

    @Test
    void validatesSearch() {
        assertBadRequest(Map.of("search", ""));
        assertBadRequest(Map.of("search", "   "));
        assertBadRequest(Map.of("search", "a"));
        assertBadRequest(Map.of("search", "a".repeat(101)));
        assertBadRequest(Map.of("search", "Joao\tSilva"));
    }

    @Test
    void validatesSort() {
        assertThat(validator.parse(Map.of("sort", "position")).sort())
                .containsExactly(PlayerSort.POSITION);
        assertThat(validator.parse(Map.of("sort", "age_desc,name")).sort())
                .containsExactly(PlayerSort.AGE_DESC, PlayerSort.NAME);

        assertBadRequest(Map.of("sort", ""));
        assertBadRequest(Map.of("sort", "POSITION"));
        assertBadRequest(Map.of("sort", "age_asc,value_desc,position"));
        assertBadRequest(Map.of("sort", "value_asc,value_desc"));
        assertBadRequest(Map.of("sort", "name,"));
        assertBadRequest(Map.of("sort", "age_asc, age_desc"));
    }

    @Test
    void ignoresUnknownParameters() {
        assertThat(validator.parse(Map.of("unknown", "1")).page()).isEqualTo(1);
    }

    @Test
    void usesRangeExtremesWhenOnlyOneBoundIsSent() {
        PlayerListQuery query = validator.parse(Map.of("min_age", "21", "max_value", "100"));

        assertThat(query.minAge()).isEqualTo(21);
        assertThat(query.maxAge()).isEqualTo(45);
        assertThat(query.minValue()).isEqualByComparingTo("0");
        assertThat(query.maxValue()).isEqualByComparingTo("100");
        assertThat(query.sort()).isEqualTo(List.of(PlayerSort.NAME));
    }
}
