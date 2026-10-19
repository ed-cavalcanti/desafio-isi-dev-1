package com.app.api;

/**
 * Leitura dos ids de caminho da URL: apenas inteiros positivos, sem zeros à
 * esquerda e dentro do intervalo de int; qualquer outra forma conta como
 * recurso inexistente (404).
 */
public final class PathId {

    private PathId() {
    }

    public static int parse(String raw) {
        if (raw == null || raw.isEmpty() || (raw.length() > 1 && raw.charAt(0) == '0')
                || !hasOnlyDigits(raw)) {
            throw notFound();
        }
        try {
            int id = Integer.parseInt(raw);
            if (id < 1) {
                throw notFound();
            }
            return id;
        } catch (NumberFormatException exception) {
            throw notFound();
        }
    }

    private static boolean hasOnlyDigits(String value) {
        return value.codePoints().allMatch(codePoint -> codePoint >= '0' && codePoint <= '9');
    }

    private static ApiException notFound() {
        return ApiException.notFound("Recurso não encontrado.");
    }
}
