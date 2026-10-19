package com.app.api;

import com.app.model.Condition;
import com.app.model.Position;
import java.math.BigDecimal;
import java.util.List;

/**
 * Filtros, ordenação e paginação validados de GET /players.
 */
public record PlayerListQuery(String search, Position position, Condition condition, Boolean free,
        Integer clubId, Integer minAge, Integer maxAge, BigDecimal minValue, BigDecimal maxValue,
        List<PlayerSort> sort, int page, int limit) {
}
