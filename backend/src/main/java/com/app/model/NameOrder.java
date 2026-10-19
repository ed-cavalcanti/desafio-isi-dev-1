package com.app.model;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Chave de ordenação alfabética das premissas: minúsculas, sem acentos e
 * comparada caractere a caractere pela ordem Unicode.
 */
public final class NameOrder {

    private static final Pattern ACCENT_MARKS = Pattern.compile("\\p{Mn}+");

    private NameOrder() {
    }

    public static String sortKey(String name) {
        String lowerCase = name.toLowerCase(Locale.ROOT);
        return ACCENT_MARKS.matcher(Normalizer.normalize(lowerCase, Normalizer.Form.NFD)).replaceAll("");
    }
}
