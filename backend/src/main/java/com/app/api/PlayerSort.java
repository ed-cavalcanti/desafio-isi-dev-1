package com.app.api;

import java.util.Comparator;
import java.util.Optional;

import com.app.model.NameOrder;
import com.app.model.Position;

/**
 * Critérios de ordenação aceitos por GET /players, com o campo usado para
 * impedir a repetição do mesmo campo em dois critérios.
 */
public enum PlayerSort {
    NAME("name", Field.NAME),
    VALUE_ASC("value_asc", Field.VALUE),
    VALUE_DESC("value_desc", Field.VALUE),
    AGE_ASC("age_asc", Field.AGE),
    AGE_DESC("age_desc", Field.AGE),
    POSITION("position", Field.POSITION);

    private final String token;
    private final Field field;

    PlayerSort(String token, Field field) {
        this.token = token;
        this.field = field;
    }

    public static Optional<PlayerSort> from(String token) {
        for (PlayerSort sort : values()) {
            if (sort.token.equals(token)) {
                return Optional.of(sort);
            }
        }
        return Optional.empty();
    }

    public Field field() {
        return field;
    }

    public Comparator<PlayerResponse> comparator() {
        return switch (this) {
            case NAME -> Comparator.comparing((PlayerResponse player) -> NameOrder.sortKey(player.name()));
            case VALUE_ASC -> Comparator.comparing(PlayerResponse::marketValue);
            case VALUE_DESC -> Comparator.comparing(PlayerResponse::marketValue).reversed();
            case AGE_ASC -> Comparator.comparing(PlayerResponse::age);
            case AGE_DESC -> Comparator.comparing(PlayerResponse::age).reversed();
            case POSITION -> Comparator.comparing(player -> Position.valueOf(player.position()));
        };
    }

    public enum Field {
        NAME,
        VALUE,
        AGE,
        POSITION
    }
}
