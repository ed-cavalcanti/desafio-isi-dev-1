package com.app.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Simulação determinística da partida (RN20): seis duelos, três ataques de cada
 * lado, com gol quando o valor do ataque é maior que o da defesa. O titular
 * MAL_CONDICIONADO joga com 15% a menos em cada atributo, arredondado para o
 * inteiro mais próximo com o meio para cima.
 */
public final class MatchCalculator {

    private static final int DUELS_PER_TEAM = 3;
    private static final int LAST_LINE_PLAYER = 4;
    private static final int MAL_CONDICIONADO_PERCENT = 85;

    private MatchCalculator() {
    }

    public static MatchSimulation play(List<PlayerSnapshot> home, List<PlayerSnapshot> away) {
        List<DuelSnapshot> duels = new ArrayList<>();
        for (int i = 0; i < DUELS_PER_TEAM; i++) {
            duels.add(duel(i + 1, home.get(LAST_LINE_PLAYER - i), away.get(i)));
        }
        for (int i = 0; i < DUELS_PER_TEAM; i++) {
            duels.add(duel(i + DUELS_PER_TEAM + 1, away.get(LAST_LINE_PLAYER - i), home.get(i)));
        }
        int homeGoals = 0;
        int awayGoals = 0;
        for (DuelSnapshot duel : duels) {
            if (duel.goal()) {
                if (duel.order() <= DUELS_PER_TEAM) {
                    homeGoals++;
                } else {
                    awayGoals++;
                }
            }
        }
        return new MatchSimulation(homeGoals, awayGoals, result(homeGoals, awayGoals), List.copyOf(duels));
    }

    private static DuelSnapshot duel(int order, PlayerSnapshot attacker, PlayerSnapshot defender) {
        Attribute attackAttribute = attackAttribute(attacker.position());
        int attackValue = value(attacker, attackAttribute);
        int defenseValue = value(defender, Attribute.DEFENDING);
        return new DuelSnapshot(order,
                new DuelistSnapshot(attacker.id(), attacker.name(), attacker.position(), attacker.condition(),
                        attackAttribute, attackValue),
                new DuelistSnapshot(defender.id(), defender.name(), defender.position(), defender.condition(),
                        Attribute.DEFENDING, defenseValue),
                attackValue > defenseValue);
    }

    private static Attribute attackAttribute(Position position) {
        return switch (position) {
            case ATA -> Attribute.SHOOTING;
            case MEI -> Attribute.PASSING;
            case ZAG, LAT -> Attribute.DRIBBLING;
            case GOL -> throw new IllegalStateException("O goleiro não participa de ataques.");
        };
    }

    private static int value(PlayerSnapshot player, Attribute attribute) {
        int value = switch (attribute) {
            case PACE -> player.attributes().pace();
            case SHOOTING -> player.attributes().shooting();
            case PASSING -> player.attributes().passing();
            case DRIBBLING -> player.attributes().dribbling();
            case DEFENDING -> player.attributes().defending();
            case PHYSICAL -> player.attributes().physical();
        };
        if (player.condition() == Condition.MAL_CONDICIONADO) {
            return (value * MAL_CONDICIONADO_PERCENT + 50) / 100;
        }
        return value;
    }

    private static MatchOutcome result(int homeGoals, int awayGoals) {
        if (homeGoals > awayGoals) {
            return MatchOutcome.MANDANTE;
        }
        if (awayGoals > homeGoals) {
            return MatchOutcome.VISITANTE;
        }
        return MatchOutcome.EMPATE;
    }
}
