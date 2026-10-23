package com.app.model;

import java.util.Optional;

/**
 * Formações aceitas na escalação (RN19): a contagem dos quatro jogadores de
 * linha por setor, sem o goleiro, de trás para frente.
 */
public enum Formation {
    THREE_ONE("3-1", 3, 0, 1),
    TWO_TWO("2-2", 2, 0, 2),
    TWO_ONE_ONE("2-1-1", 2, 1, 1),
    ONE_TWO_ONE("1-2-1", 1, 2, 1);

    private final String code;
    private final int defense;
    private final int midfield;
    private final int attack;

    Formation(String code, int defense, int midfield, int attack) {
        this.code = code;
        this.defense = defense;
        this.midfield = midfield;
        this.attack = attack;
    }

    public static Optional<Formation> from(String code) {
        for (Formation formation : values()) {
            if (formation.code.equals(code)) {
                return Optional.of(formation);
            }
        }
        return Optional.empty();
    }

    public String code() {
        return code;
    }

    public int defense() {
        return defense;
    }

    public int midfield() {
        return midfield;
    }

    public int attack() {
        return attack;
    }
}
