package com.app.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.api.ApiException;
import com.app.api.DuelResponse;
import com.app.api.DuelistResponse;
import com.app.api.LineupResponse;
import com.app.api.MatchRequest;
import com.app.api.MatchRequestValidator;
import com.app.api.MatchResponse;
import com.app.api.PlayerResponse;
import com.app.model.Attribute;
import com.app.model.BrasiliaTime;
import com.app.model.Condition;
import com.app.model.DuelSnapshot;
import com.app.model.DuelistSnapshot;
import com.app.model.MatchCalculator;
import com.app.model.MatchSimulation;
import com.app.model.PlayerAttributes;
import com.app.model.PlayerSnapshot;
import com.app.model.Position;
import com.app.persistence.Clube;
import com.app.persistence.ClubeRepository;
import com.app.persistence.Duelo;
import com.app.persistence.DueloRepository;
import com.app.persistence.Partida;
import com.app.persistence.PartidaRepository;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * Partidas da liga (RN20 e RN21): a partida é jogada na hora, com os titulares
 * das escalações completas, e grava o placar, as formações e os seis duelos.
 */
@Service
public class MatchService {

    private final MatchRequestValidator validator;
    private final LineupService lineups;
    private final ClubeRepository clubes;
    private final PartidaRepository partidas;
    private final DueloRepository duelos;

    public MatchService(MatchRequestValidator validator, LineupService lineups, ClubeRepository clubes,
            PartidaRepository partidas, DueloRepository duelos) {
        this.validator = validator;
        this.lineups = lineups;
        this.clubes = clubes;
        this.partidas = partidas;
        this.duelos = duelos;
    }

    @Transactional
    public MatchResponse play(JsonNode body) {
        MatchRequest request = validator.match(body);
        Clube mandante = findClub(request.homeClubId());
        Clube visitante = findClub(request.awayClubId());
        LineupResponse homeLineup = lineups.get(String.valueOf(mandante.id()));
        LineupResponse awayLineup = lineups.get(String.valueOf(visitante.id()));
        if (!homeLineup.complete() || !awayLineup.complete()) {
            throw ApiException.conflict("Os dois clubes precisam da escalação completa com os 5 titulares.");
        }
        MatchSimulation simulation = MatchCalculator.play(snapshots(homeLineup.players()),
                snapshots(awayLineup.players()));
        LocalDateTime now = BrasiliaTime.now();
        Partida partida = partidas.save(new Partida(mandante.id(), visitante.id(), simulation.homeGoals(),
                simulation.awayGoals(), simulation.result(), homeLineup.formation(), awayLineup.formation(), now));
        List<DuelResponse> duels = simulation.duels().stream()
                .map(duel -> toDuelo(partida.id(), duel))
                .map(duelos::save)
                .map(this::toDuelResponse)
                .toList();
        return toResponse(partida, mandante, visitante, duels);
    }

    private Clube findClub(int clubId) {
        return clubes.findById(clubId)
                .orElseThrow(() -> ApiException.notFound("Clube não encontrado."));
    }

    private List<PlayerSnapshot> snapshots(List<PlayerResponse> players) {
        return players.stream()
                .map(player -> new PlayerSnapshot(player.id(), player.name(), Position.valueOf(player.position()),
                        Condition.valueOf(player.condition()),
                        new PlayerAttributes(player.pace(), player.shooting(), player.passing(), player.dribbling(),
                                player.defending(), player.physical(), player.potential())))
                .toList();
    }

    private Duelo toDuelo(Integer partidaId, DuelSnapshot duel) {
        DuelistSnapshot attacker = duel.attacker();
        DuelistSnapshot defender = duel.defender();
        return new Duelo(partidaId, duel.order(),
                attacker.playerId(), attacker.name(), attacker.position(), attacker.condition(),
                attributeName(attacker.attribute()), attacker.value(),
                defender.playerId(), defender.name(), defender.position(), defender.condition(),
                attributeName(defender.attribute()), defender.value(),
                duel.goal());
    }

    private DuelResponse toDuelResponse(Duelo duelo) {
        DuelistResponse attacker = new DuelistResponse(duelo.atacanteJogadorId(), duelo.atacanteNome(),
                duelo.atacantePosicao().name(), duelo.atacanteCondicao().name(), duelo.atacanteAtributo(),
                duelo.atacanteValor());
        DuelistResponse defender = new DuelistResponse(duelo.defensorJogadorId(), duelo.defensorNome(),
                duelo.defensorPosicao().name(), duelo.defensorCondicao().name(), duelo.defensorAtributo(),
                duelo.defensorValor());
        return new DuelResponse(duelo.ordem(), attacker, defender, duelo.gol());
    }

    private String attributeName(Attribute attribute) {
        return attribute.name().toLowerCase(Locale.ROOT);
    }

    private MatchResponse toResponse(Partida partida, Clube mandante, Clube visitante, List<DuelResponse> duels) {
        return new MatchResponse(partida.id(), mandante.id(), mandante.nome(), visitante.id(), visitante.nome(),
                partida.golsMandante(), partida.golsVisitante(), partida.resultado(),
                BrasiliaTime.format(partida.jogadoEm()), partida.formacaoMandante(), partida.formacaoVisitante(),
                duels);
    }
}
