package com.app.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.api.StandingResponse;
import com.app.model.MatchOutcome;
import com.app.model.NameOrder;
import com.app.persistence.Clube;
import com.app.persistence.ClubeRepository;
import com.app.persistence.Partida;
import com.app.persistence.PartidaRepository;

/**
 * Classificação da liga (RN21): calculada a cada consulta a partir das partidas
 * gravadas, com todos os clubes, inclusive os que ainda não jogaram.
 */
@Service
public class StandingsService {

    private static final int WIN_POINTS = 3;
    private static final int DRAW_POINTS = 1;

    private final ClubeRepository clubes;
    private final PartidaRepository partidas;

    public StandingsService(ClubeRepository clubes, PartidaRepository partidas) {
        this.clubes = clubes;
        this.partidas = partidas;
    }

    @Transactional(readOnly = true)
    public List<StandingResponse> standings() {
        List<Clube> clubs = clubes.findAll();
        Map<Integer, Stats> stats = new HashMap<>();
        for (Clube clube : clubs) {
            stats.put(clube.id(), new Stats());
        }
        for (Partida partida : partidas.findAll()) {
            add(stats.get(partida.mandanteClubeId()), partida.golsMandante(), partida.golsVisitante(),
                    partida.resultado() == MatchOutcome.MANDANTE ? WIN_POINTS
                            : partida.resultado() == MatchOutcome.EMPATE ? DRAW_POINTS : 0);
            add(stats.get(partida.visitanteClubeId()), partida.golsVisitante(), partida.golsMandante(),
                    partida.resultado() == MatchOutcome.VISITANTE ? WIN_POINTS
                            : partida.resultado() == MatchOutcome.EMPATE ? DRAW_POINTS : 0);
        }
        List<Clube> ordered = new ArrayList<>(clubs);
        ordered.sort(Comparator
                .comparing((Clube clube) -> stats.get(clube.id()).points).reversed()
                .thenComparing(Comparator.comparing((Clube clube) -> stats.get(clube.id()).goalDifference()).reversed())
                .thenComparing(Comparator.comparing((Clube clube) -> stats.get(clube.id()).goalsFor).reversed())
                .thenComparing((Clube clube) -> NameOrder.sortKey(clube.nome()))
                .thenComparing(Clube::id));
        List<StandingResponse> standings = new ArrayList<>();
        for (int i = 0; i < ordered.size(); i++) {
            Clube clube = ordered.get(i);
            standings.add(toResponse(i + 1, clube, stats.get(clube.id())));
        }
        return List.copyOf(standings);
    }

    private void add(Stats stats, int goalsFor, int goalsAgainst, int points) {
        stats.played++;
        stats.goalsFor += goalsFor;
        stats.goalsAgainst += goalsAgainst;
        stats.points += points;
        if (goalsFor > goalsAgainst) {
            stats.wins++;
        } else if (goalsFor < goalsAgainst) {
            stats.losses++;
        } else {
            stats.draws++;
        }
    }

    private StandingResponse toResponse(int position, Clube clube, Stats stats) {
        return new StandingResponse(position, clube.id(), clube.nome(), stats.played, stats.wins, stats.draws,
                stats.losses, stats.goalsFor, stats.goalsAgainst, stats.goalDifference(), stats.points);
    }

    private static final class Stats {
        private int played;
        private int wins;
        private int draws;
        private int losses;
        private int goalsFor;
        private int goalsAgainst;
        private int points;

        private int goalDifference() {
            return goalsFor - goalsAgainst;
        }
    }
}
