package com.app.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class MatchCalculatorTest {

    private PlayerSnapshot player(int id, String name, Position position, Condition condition, int shooting,
            int passing, int dribbling, int defending) {
        return new PlayerSnapshot(id, name, position, condition,
                new PlayerAttributes(50, shooting, passing, dribbling, defending, 50, 80));
    }

    private List<PlayerSnapshot> team(PlayerSnapshot gol, PlayerSnapshot zag, PlayerSnapshot lat, PlayerSnapshot mei,
            PlayerSnapshot ata) {
        return List.of(gol, zag, lat, mei, ata);
    }

    @Test
    @DisplayName("reproduz o exemplo completo da RN20: Águias FC 1 × 2 Delta FC")
    void playsWorkedExample() {
        List<PlayerSnapshot> home = team(
                player(30, "Rui Prado", Position.GOL, Condition.APTO, 50, 50, 50, 77),
                player(32, "Téo Brandão", Position.ZAG, Condition.APTO, 50, 50, 50, 84),
                player(31, "Davi Lins", Position.LAT, Condition.MAL_CONDICIONADO, 50, 50, 74, 66),
                player(33, "Lauro Neves", Position.MEI, Condition.APTO, 50, 82, 50, 50),
                player(34, "Otto Rangel", Position.ATA, Condition.APTO, 75, 50, 50, 50));
        List<PlayerSnapshot> away = team(
                player(40, "Ivo Teles", Position.GOL, Condition.APTO, 50, 50, 50, 72),
                player(41, "Hugo Vaz", Position.ZAG, Condition.APTO, 50, 50, 50, 84),
                player(42, "Lino Matos", Position.LAT, Condition.APTO, 50, 50, 79, 63),
                player(43, "Nei Soares", Position.MEI, Condition.APTO, 50, 70, 50, 50),
                player(44, "Ugo Falcão", Position.ATA, Condition.APTO, 81, 50, 50, 50));

        MatchSimulation simulation = MatchCalculator.play(home, away);

        assertThat(simulation.homeGoals()).isEqualTo(1);
        assertThat(simulation.awayGoals()).isEqualTo(2);
        assertThat(simulation.result()).isEqualTo(MatchOutcome.VISITANTE);
        assertThat(simulation.duels()).hasSize(6);

        DuelSnapshot first = simulation.duels().get(0);
        assertThat(first.order()).isEqualTo(1);
        assertThat(first.attacker().playerId()).isEqualTo(34);
        assertThat(first.attacker().attribute()).isEqualTo(Attribute.SHOOTING);
        assertThat(first.attacker().value()).isEqualTo(75);
        assertThat(first.defender().playerId()).isEqualTo(40);
        assertThat(first.defender().value()).isEqualTo(72);
        assertThat(first.goal()).isTrue();

        DuelSnapshot second = simulation.duels().get(1);
        assertThat(second.attacker().playerId()).isEqualTo(33);
        assertThat(second.attacker().attribute()).isEqualTo(Attribute.PASSING);
        assertThat(second.attacker().value()).isEqualTo(82);
        assertThat(second.defender().playerId()).isEqualTo(41);
        assertThat(second.goal()).isFalse();

        DuelSnapshot third = simulation.duels().get(2);
        assertThat(third.attacker().playerId()).isEqualTo(31);
        assertThat(third.attacker().attribute()).isEqualTo(Attribute.DRIBBLING);
        assertThat(third.attacker().value()).isEqualTo(63);
        assertThat(third.defender().playerId()).isEqualTo(42);
        assertThat(third.defender().value()).isEqualTo(63);
        assertThat(third.goal()).isFalse();

        DuelSnapshot fourth = simulation.duels().get(3);
        assertThat(fourth.order()).isEqualTo(4);
        assertThat(fourth.attacker().playerId()).isEqualTo(44);
        assertThat(fourth.defender().playerId()).isEqualTo(30);
        assertThat(fourth.defender().attribute()).isEqualTo(Attribute.DEFENDING);
        assertThat(fourth.goal()).isTrue();

        DuelSnapshot fifth = simulation.duels().get(4);
        assertThat(fifth.attacker().playerId()).isEqualTo(43);
        assertThat(fifth.defender().playerId()).isEqualTo(32);
        assertThat(fifth.goal()).isFalse();

        DuelSnapshot sixth = simulation.duels().get(5);
        assertThat(sixth.attacker().playerId()).isEqualTo(42);
        assertThat(sixth.attacker().value()).isEqualTo(79);
        assertThat(sixth.defender().playerId()).isEqualTo(31);
        assertThat(sixth.defender().value()).isEqualTo(56);
        assertThat(sixth.goal()).isTrue();
    }

    @Test
    @DisplayName("condição MAL_CONDICIONADO reduz 15% com o meio arredondado para cima")
    void roundsConditionEffectHalfUp() {
        List<PlayerSnapshot> home = team(
                player(1, "Rui Prado", Position.GOL, Condition.APTO, 50, 50, 50, 50),
                player(2, "Téo Brandão", Position.ZAG, Condition.APTO, 50, 50, 50, 50),
                player(3, "Davi Lins", Position.LAT, Condition.APTO, 50, 50, 50, 50),
                player(4, "Lauro Neves", Position.MEI, Condition.APTO, 50, 50, 50, 50),
                player(5, "Otto Rangel", Position.ATA, Condition.MAL_CONDICIONADO, 50, 50, 50, 50));
        List<PlayerSnapshot> away = team(
                player(6, "Ivo Teles", Position.GOL, Condition.APTO, 50, 50, 50, 42),
                player(7, "Hugo Vaz", Position.ZAG, Condition.APTO, 50, 50, 50, 50),
                player(8, "Lino Matos", Position.LAT, Condition.APTO, 50, 50, 50, 50),
                player(9, "Nei Soares", Position.MEI, Condition.APTO, 50, 50, 50, 50),
                player(10, "Ugo Falcão", Position.ATA, Condition.APTO, 50, 50, 50, 50));

        MatchSimulation simulation = MatchCalculator.play(home, away);

        DuelSnapshot first = simulation.duels().get(0);
        assertThat(first.attacker().value()).isEqualTo(43);
        assertThat(first.goal()).isTrue();
    }

    @Test
    @DisplayName("duelo empatado não é gol e o mandante vence quando marca mais")
    void playsDrawsAndHomeWins() {
        List<PlayerSnapshot> balanced = team(
                player(1, "Rui Prado", Position.GOL, Condition.APTO, 50, 50, 50, 50),
                player(2, "Téo Brandão", Position.ZAG, Condition.APTO, 50, 50, 50, 50),
                player(3, "Davi Lins", Position.LAT, Condition.APTO, 50, 50, 50, 50),
                player(4, "Lauro Neves", Position.MEI, Condition.APTO, 50, 50, 50, 50),
                player(5, "Otto Rangel", Position.ATA, Condition.APTO, 50, 50, 50, 50));

        MatchSimulation draw = MatchCalculator.play(balanced, balanced);

        assertThat(draw.homeGoals()).isZero();
        assertThat(draw.awayGoals()).isZero();
        assertThat(draw.result()).isEqualTo(MatchOutcome.EMPATE);
        assertThat(draw.duels()).allSatisfy(duel -> assertThat(duel.goal()).isFalse());

        List<PlayerSnapshot> strongAttack = team(
                player(11, "Goleiro", Position.GOL, Condition.APTO, 50, 50, 50, 50),
                player(12, "Zagueiro", Position.ZAG, Condition.APTO, 50, 50, 50, 50),
                player(13, "Lateral", Position.LAT, Condition.APTO, 50, 50, 50, 50),
                player(14, "Meia", Position.MEI, Condition.APTO, 50, 99, 50, 50),
                player(15, "Atacante", Position.ATA, Condition.APTO, 99, 50, 50, 50));

        MatchSimulation homeWin = MatchCalculator.play(strongAttack, balanced);

        assertThat(homeWin.homeGoals()).isEqualTo(2);
        assertThat(homeWin.awayGoals()).isZero();
        assertThat(homeWin.result()).isEqualTo(MatchOutcome.MANDANTE);
    }
}
