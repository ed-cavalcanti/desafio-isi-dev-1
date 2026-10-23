package com.app.model;

/**
 * Regras de V4 para campos de nome e para o search: espaços repetidos viram um
 * só, espaços nas pontas são removidos, caracteres de controle são recusados e
 * a contagem de caracteres e de palavras segue as definições do enunciado
 * (caractere é um ponto de código Unicode e palavra é uma sequência sem espaços
 * com pelo menos uma letra).
 */
public final class NameText {

    private NameText() {
    }

    public static String normalize(String raw) {
        return raw.replaceAll(" +", " ").trim();
    }

    public static boolean hasControlChar(String value) {
        return value.codePoints().anyMatch(Character::isISOControl);
    }

    public static boolean hasDigit(String value) {
        return value.codePoints().anyMatch(codePoint -> codePoint >= '0' && codePoint <= '9');
    }

    public static int length(String value) {
        return value.codePointCount(0, value.length());
    }

    public static int words(String value) {
        int count = 0;
        for (String part : value.split(" ", -1)) {
            if (part.codePoints().anyMatch(Character::isLetter)) {
                count++;
            }
        }
        return count;
    }
}
