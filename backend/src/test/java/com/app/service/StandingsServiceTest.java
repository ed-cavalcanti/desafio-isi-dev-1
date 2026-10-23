package com.app.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.app.api.StandingResponse;
import com.app.model.MatchOutcome;
import com.app.persistence.Clube;
import com.app.persistence.ClubeRepository;
import com.app.persistence.Partida;
import com.app.persistence.PartidaRepository;

@ExtendWith(MockitoExtension.class)
class StandingsServiceTest {

    @Mock
    private ClubeRepository clubes;

    @Mock
    private PartidaRepository partidas;

    private StandingsService service;

    @BeforeEach
    void setUp() {
        service = new StandingsService(clubes, partidas);
    }

    private Clube club(int id, String name) {
        Clube clube = new Clube();
        clube.nome(name);
        clube.nomeBusca(name.toLowerCase());
        clube.sigla("C" + id + "C");
        clube.caixa(new BigDecimal("300.00"));
        ReflectionTestUtils.setField(clube, "id", id);
        return clube;
    }

    private Partida match(int id, int home, int away, int homeGoals, int awayGoals) {
        MatchOutcome result = homeGoals > awayGoals ? MatchOutcome.MANDANTE
                : awayGoals > homeGoals ? MatchOutcome.VISITANTE : MatchOutcome.EMPATE;
        Partida partida = new Partida(home, away, homeGoals, awayGoals, result, "2-1-1", "2-1-1",
                LocalDateTime.of(2026, 11, 1, 10, 0).plusDays(id));
        ReflectionTestUtils.setField(partida, "id", id);
        return partida;
    }

    @Test
    @DisplayName("reproduz o exemplo de classificação da RN21")
    void calculatesWorkedExample() {
        when(clubes.findAll()).thenReturn(List.of(
                club(1, "Águias FC"), club(2, "Delta FC"), club(3, "Gama SC"),
                club(4, "Épsilon EC"), club(5, "Mangue FC"), club(6, "Tubarões EC")));
        when(partidas.findAll()).thenReturn(List.of(
                match(1, 1, 2, 1, 2),
                match(2, 3, 4, 2, 1),
                match(3, 4, 1, 3, 2),
                match(4, 2, 3, 0, 1)));

        List<StandingResponse> standings = service.standings();

        assertThat(standings).extracting(StandingResponse::clubName)
                .containsExactly("Gama SC", "Épsilon EC", "Delta FC", "Mangue FC", "Tubarões EC", "Águias FC");
        assertThat(standings).extracting(StandingResponse::position).containsExactly(1, 2, 3, 4, 5, 6);

        StandingResponse leader = standings.get(0);
        assertThat(leader.played()).isEqualTo(2);
        assertThat(leader.wins()).isEqualTo(2);
        assertThat(leader.points()).isEqualTo(6);
        assertThat(leader.goalsFor()).isEqualTo(3);
        assertThat(leader.goalsAgainst()).isEqualTo(1);
        assertThat(leader.goalDifference()).isEqualTo(2);

        StandingResponse second = standings.get(1);
        assertThat(second.points()).isEqualTo(3);
        assertThat(second.goalDifference()).isZero();
        assertThat(second.goalsFor()).isEqualTo(4);

        StandingResponse third = standings.get(2);
        assertThat(third.points()).isEqualTo(3);
        assertThat(third.goalsFor()).isEqualTo(2);

        StandingResponse last = standings.get(5);
        assertThat(last.points()).isZero();
        assertThat(last.goalDifference()).isEqualTo(-2);
    }

    @Test
    @DisplayName("clubes sem partidas entram zerados e o empate é desfeito pelo nome e pelo id")
    void includesClubsWithoutMatches() {
        when(clubes.findAll()).thenReturn(List.of(
                club(2, "Tubarões EC"), club(3, "Águias FC"), club(1, "Aguias FC")));
        when(partidas.findAll()).thenReturn(List.of());

        List<StandingResponse> standings = service.standings();

        assertThat(standings).extracting(StandingResponse::clubId).containsExactly(1, 3, 2);
        assertThat(standings).extracting(StandingResponse::position).containsExactly(1, 2, 3);
        assertThat(standings).allSatisfy(row -> {
            assertThat(row.played()).isZero();
            assertThat(row.points()).isZero();
            assertThat(row.goalDifference()).isZero();
        });
    }

    @Test
    @DisplayName("empates e derrotas contam pontos e gols corretamente")
    void countsDrawsAndLosses() {
        when(clubes.findAll()).thenReturn(List.of(club(1, "Alfa FC"), club(2, "Beta FC")));
        when(partidas.findAll()).thenReturn(List.of(
                match(1, 1, 2, 2, 2),
                match(2, 2, 1, 1, 3)));

        List<StandingResponse> standings = service.standings();

        assertThat(standings.get(0).clubId()).isEqualTo(1);
        assertThat(standings.get(0).draws()).isEqualTo(1);
        assertThat(standings.get(0).wins()).isEqualTo(1);
        assertThat(standings.get(0).points()).isEqualTo(4);
        assertThat(standings.get(0).goalsFor()).isEqualTo(5);
        assertThat(standings.get(0).goalsAgainst()).isEqualTo(3);
        assertThat(standings.get(1).losses()).isEqualTo(1);
        assertThat(standings.get(1).draws()).isEqualTo(1);
        assertThat(standings.get(1).points()).isEqualTo(1);
    }

    @Test
    @DisplayName("devolve lista vazia sem clubes")
    void returnsEmptyStandings() {
        when(clubes.findAll()).thenReturn(List.of());
        when(partidas.findAll()).thenReturn(List.of());

        assertThat(service.standings()).isEmpty();
    }
}
