package com.app.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

class ClubRequestValidatorTest {

    private final ObjectMapper JSON = new ObjectMapper();
    private final ClubRequestValidator validator = new ClubRequestValidator();

    private ObjectNode body(String name, String acronym) {
        ObjectNode body = JSON.createObjectNode();
        body.put("name", name);
        body.put("acronym", acronym);
        return body;
    }

    private void assertBadRequest(JsonNode body) {
        ApiException exception = assertThrows(ApiException.class, () -> validator.create(body));
        assertThat(exception.status()).isEqualTo(400);
    }

    @Test
    @DisplayName("aceita um corpo válido e normaliza os espaços do nome")
    void acceptsAValidBody() {
        ClubRequest request = validator.create(body("  Águias   FC ", "AFC"));

        assertThat(request.name()).isEqualTo("Águias FC");
        assertThat(request.acronym()).isEqualTo("AFC");
    }

    @Test
    @DisplayName("aceita hífen e ponto no nome e sigla com letras repetidas em parte")
    void acceptsHyphenAndDotAndPartiallyRepeatedAcronym() {
        assertThat(validator.create(body("A.B. Rio-Clube", "ARC")).acronym()).isEqualTo("ARC");
    }

    @Test
    @DisplayName("recusa corpo que não é objeto e campos ausentes ou que não são texto")
    void rejectsInvalidBodies() {
        assertBadRequest(null);
        assertBadRequest(JSON.createArrayNode());
        assertBadRequest(JSON.createObjectNode().put("name", "Águias FC"));
        assertBadRequest(body("Águias FC", null));
        ObjectNode numberName = JSON.createObjectNode();
        numberName.put("name", 10);
        numberName.put("acronym", "AFC");
        assertBadRequest(numberName);
    }

    @Test
    @DisplayName("recusa nome com tamanho fora de 3 a 60 caracteres")
    void rejectsNameLength() {
        assertBadRequest(body("FC", "FC"));
        assertBadRequest(body("A".repeat(59) + " BC", "ABC"));
    }

    @Test
    @DisplayName("recusa nome com caracteres fora de letras, espaços, hífen e ponto")
    void rejectsNameWithInvalidCharacters() {
        assertBadRequest(body("Águias 2 FC", "AFC"));
        assertBadRequest(body("Águias_FC", "AFC"));
    }

    @Test
    @DisplayName("recusa nome com menos de 2 ou mais de 5 palavras")
    void rejectsNameWordCount() {
        assertBadRequest(body("Águias", "AG"));
        assertBadRequest(body("A B C D E F", "ABC"));
    }

    @Test
    @DisplayName("recusa nome com caractere de controle")
    void rejectsNameWithControlCharacter() {
        assertBadRequest(body("Águias\nFC", "AFC"));
    }

    @Test
    @DisplayName("recusa sigla que não tem exatamente 3 letras maiúsculas de A a Z")
    void rejectsAcronymShape() {
        assertBadRequest(body("Águias FC", "afC"));
        assertBadRequest(body("Águias FC", "AF"));
        assertBadRequest(body("Águias FC", "AFCD"));
        assertBadRequest(body("Águias FC", "A-C"));
        assertBadRequest(body("Águias FC", "ÁFC"));
    }

    @Test
    @DisplayName("recusa sigla com as três letras iguais")
    void rejectsAcronymWithAllLettersEqual() {
        assertBadRequest(body("Aguas Amargas AA", "AAA"));
    }

    @Test
    @DisplayName("recusa sigla cujas letras não aparecem no nome em ordem ou não começam pela primeira letra")
    void rejectsAcronymOutsideName() {
        assertBadRequest(body("Águias FC", "AFT"));
        assertBadRequest(body("Águias FC", "GFC"));
        assertBadRequest(body("Águias FC", "ACS"));
        assertBadRequest(body("Águias FC", "AFG"));
    }

    @Test
    @DisplayName("aceita sigla ignorando maiúsculas e acentos do nome")
    void acceptsAcronymIgnoringCaseAndAccents() {
        assertThat(validator.create(body("Águia do Sul", "AGS")).acronym()).isEqualTo("AGS");
        assertThat(validator.create(body("Águia do Sul", "ADS")).acronym()).isEqualTo("ADS");
    }
}
