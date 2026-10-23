package com.app.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.EnumSet;
import java.util.Map;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.app.model.TransactionType;

class TransactionQueryValidatorTest {

    private final TransactionQueryValidator validator = new TransactionQueryValidator();

    private void assertBadRequest(Map<String, String> params) {
        ApiException exception = assertThrows(ApiException.class, () -> validator.parse(params));
        assertThat(exception.status()).isEqualTo(400);
    }

    @Test
    @DisplayName("sem parâmetros não filtra")
    void usesDefaultsWhenParametersAreAbsent() {
        TransactionQuery query = validator.parse(Map.of());

        assertThat(query.types()).isNull();
        assertThat(query.playerId()).isNull();
    }

    @Test
    @DisplayName("aceita um ou mais tipos e o jogador")
    void acceptsEveryParameter() {
        assertThat(validator.parse(Map.of("type", "COMPRA")).types())
                .isEqualTo(EnumSet.of(TransactionType.COMPRA));
        assertThat(validator.parse(Map.of("type", "COMPRA,VENDA")).types())
                .isEqualTo(EnumSet.of(TransactionType.COMPRA, TransactionType.VENDA));
        assertThat(validator.parse(Map.of("player_id", "7")).playerId()).isEqualTo(7);
    }

    @Test
    @DisplayName("ignora parâmetros desconhecidos")
    void ignoresUnknownParameters() {
        assertThat(validator.parse(Map.of("foo", "bar")).types()).isNull();
    }

    @Test
    @DisplayName("recusa type vazio, em minúsculas, com espaços ou repetido")
    void rejectsInvalidTypes() {
        assertBadRequest(Map.of("type", ""));
        assertBadRequest(Map.of("type", "compra"));
        assertBadRequest(Map.of("type", "COMPRA,venda"));
        assertBadRequest(Map.of("type", "COMPRA, VENDA"));
        assertBadRequest(Map.of("type", "COMPRA,COMPRA"));
        assertBadRequest(Map.of("type", "COMPRA,"));
    }

    @Test
    @DisplayName("recusa player_id fora do formato de inteiro positivo")
    void rejectsInvalidPlayerIds() {
        assertBadRequest(Map.of("player_id", ""));
        assertBadRequest(Map.of("player_id", "0"));
        assertBadRequest(Map.of("player_id", "01"));
        assertBadRequest(Map.of("player_id", "-1"));
        assertBadRequest(Map.of("player_id", "1.5"));
        assertBadRequest(Map.of("player_id", "abc"));
    }
}
