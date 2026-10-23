package com.app.model;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;
import java.util.regex.Pattern;

/**
 * Datas e horas da API (RN01): o instante do servidor expresso no horário de
 * Brasília, fuso fixo de −03:00, sem horário de verão. A entrada segue o
 * formato {@code AAAA-MM-DDTHH:MM-03:00} e a saída, {@code
 * AAAA-MM-DDTHH:MM:SS-03:00}.
 */
public final class BrasiliaTime {

    private static final ZoneOffset ZONE = ZoneOffset.ofHours(-3);
    private static final String OFFSET = "-03:00";
    private static final Pattern INPUT_FORMAT = Pattern.compile("\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}-03:00");
    private static final DateTimeFormatter INPUT = new DateTimeFormatterBuilder()
            .appendPattern("uuuu-MM-dd'T'HH:mm")
            .toFormatter()
            .withResolverStyle(ResolverStyle.STRICT);
    private static final DateTimeFormatter OUTPUT = DateTimeFormatter.ofPattern("uuuu-MM-dd'T'HH:mm:ss");

    private BrasiliaTime() {
    }

    public static LocalDateTime now() {
        return OffsetDateTime.now(ZONE).toLocalDateTime();
    }

    /**
     * Lê o formato de entrada da RN01; datas e horas inexistentes ou formatos
     * diferentes levam a {@link DateTimeParseException}.
     */
    public static LocalDateTime parse(String raw) {
        if (raw == null || !INPUT_FORMAT.matcher(raw).matches()) {
            throw new DateTimeParseException("Data e hora fora do formato AAAA-MM-DDTHH:MM-03:00", String.valueOf(raw), 0);
        }
        return LocalDateTime.parse(raw.substring(0, raw.length() - OFFSET.length()), INPUT);
    }

    public static String format(LocalDateTime time) {
        return time.format(OUTPUT) + OFFSET;
    }
}
