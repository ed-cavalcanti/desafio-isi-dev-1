package com.app.model;

import java.util.Comparator;
import java.util.function.Function;

/**
 * Ordem do elenco (RN11): posição na ordem GOL, ZAG, LAT, MEI, ATA, depois o
 * nome em ordem alfabética (Premissas) e depois o id crescente.
 */
public final class SquadOrder {

    private SquadOrder() {
    }

    public static <T> Comparator<T> comparator(Function<T, Position> position, Function<T, String> name,
            Function<T, Integer> id) {
        return Comparator.comparing(position)
                .thenComparing(player -> NameOrder.sortKey(name.apply(player)))
                .thenComparing(id);
    }
}
