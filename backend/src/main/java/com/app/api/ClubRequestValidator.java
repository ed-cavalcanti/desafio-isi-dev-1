package com.app.api;

import java.text.Normalizer;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

import com.app.model.NameText;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * Validação do corpo de POST /clubs: nome nas regras de V4 e dos limites do
 * clube, e sigla com as três letras do nome na ordem (RN10).
 */
@Component
public class ClubRequestValidator {

    private static final int NAME_MIN = 3;
    private static final int NAME_MAX = 60;
    private static final int WORDS_MIN = 2;
    private static final int WORDS_MAX = 5;
    private static final int ACRONYM_LENGTH = 3;
    private static final Pattern NAME_CHARS = Pattern.compile("[\\p{L} \\-.]+");
    private static final Pattern ACRONYM_CHARS = Pattern.compile("[A-Z]{3}");
    private static final Pattern ACCENT_MARKS = Pattern.compile("\\p{Mn}+");

    public ClubRequest create(JsonNode body) {
        if (body == null || !body.isObject()) {
            throw ApiException.badRequest("Corpo da requisição deve ser um objeto JSON.");
        }
        String name = name(body);
        String acronym = acronym(body, name);
        return new ClubRequest(name, acronym);
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
            throw ApiException.badRequest("O campo name deve ter de 3 a 60 caracteres.");
        }
        if (!NAME_CHARS.matcher(name).matches()) {
            throw ApiException.badRequest("O campo name aceita apenas letras, espaços, hífen e ponto.");
        }
        int words = NameText.words(name);
        if (words < WORDS_MIN || words > WORDS_MAX) {
            throw ApiException.badRequest("O campo name deve ter de 2 a 5 palavras.");
        }
        return name;
    }

    private String acronym(JsonNode body, String name) {
        JsonNode node = body.get("acronym");
        if (node == null || node.isNull() || !node.isTextual()) {
            throw ApiException.badRequest("O campo acronym é obrigatório e deve ser um texto.");
        }
        String acronym = node.asText();
        if (!ACRONYM_CHARS.matcher(acronym).matches()) {
            throw ApiException.badRequest("O campo acronym deve ter exatamente 3 letras de A a Z, maiúsculas e sem acento.");
        }
        if (acronym.charAt(0) == acronym.charAt(1) && acronym.charAt(1) == acronym.charAt(2)) {
            throw ApiException.badRequest("O campo acronym não pode ter as três letras iguais.");
        }
        if (!appearsInName(acronym, name)) {
            throw ApiException.badRequest(
                    "O campo acronym deve ter letras que aparecem no nome do clube nessa ordem, começando pela primeira letra do nome.");
        }
        return acronym;
    }

    /**
     * As três letras aparecem no nome em ordem, sem diferenciar maiúsculas,
     * minúsculas e acentos, e a primeira delas é a primeira letra do nome.
     */
    private boolean appearsInName(String acronym, String name) {
        String letters = letters(name);
        if (letters.isEmpty() || letters.charAt(0) != acronym.charAt(0)) {
            return false;
        }
        int index = 1;
        for (int i = 1; i < ACRONYM_LENGTH; i++) {
            char letter = acronym.charAt(i);
            while (index < letters.length() && letters.charAt(index) != letter) {
                index++;
            }
            if (index == letters.length()) {
                return false;
            }
            index++;
        }
        return true;
    }

    private String letters(String name) {
        String withoutMarks = ACCENT_MARKS.matcher(Normalizer.normalize(name, Normalizer.Form.NFD)).replaceAll("");
        StringBuilder letters = new StringBuilder();
        withoutMarks.codePoints().filter(Character::isLetter)
                .forEach(codePoint -> letters.appendCodePoint(Character.toUpperCase(codePoint)));
        return letters.toString();
    }
}
