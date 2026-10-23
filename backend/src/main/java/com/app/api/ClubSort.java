package com.app.api;

import java.util.Comparator;
import java.util.Optional;

import com.app.model.NameOrder;

/**
 * Critérios de ordenação aceitos por GET /clubs.
 */
public enum ClubSort {
    NAME("name"),
    NET_WORTH_ASC("net_worth_asc"),
    NET_WORTH_DESC("net_worth_desc");

    private final String token;

    ClubSort(String token) {
        this.token = token;
    }

    public static Optional<ClubSort> from(String token) {
        for (ClubSort sort : values()) {
            if (sort.token.equals(token)) {
                return Optional.of(sort);
            }
        }
        return Optional.empty();
    }

    public Comparator<ClubResponse> comparator() {
        return switch (this) {
            case NAME -> Comparator.comparing((ClubResponse club) -> NameOrder.sortKey(club.name()));
            case NET_WORTH_ASC -> Comparator.comparing(ClubResponse::netWorth);
            case NET_WORTH_DESC -> Comparator.comparing(ClubResponse::netWorth).reversed();
        };
    }
}
