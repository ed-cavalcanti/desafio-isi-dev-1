package com.app.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.api.ApiException;
import com.app.api.DuelResponse;
import com.app.api.DuelistResponse;
import com.app.api.LineupResponse;
import com.app.api.MatchQuery;
import com.app.api.MatchRequest;
import com.app.api.MatchRequestValidator;
import com.app.api.MatchResponse;
import com.app.api.MatchSideResponse;
import com.app.api.MatchSummaryResponse;
import com.app.api.PathId;
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
                .map(duel -> toDuelo(partida, duel))
                .map(duelos::save)
                .map(this::toDuelResponse)
                .toList();
        return toResponse(partida, mandante.nome(), visitante.nome(), duels);
    }

    /**
     * RN21.1: histórico da mais recente para a mais antiga; no mesmo instante,
     * o id maior vem primeiro.
     */
    @Transactional(readOnly = true)
    public List<MatchSummaryResponse> list(MatchQuery query) {
        if (query.clubId() != null && clubes.findById(query.clubId()).isEmpty()) {
            throw ApiException.notFound("Clube não encontrado.");
        }
        Map<Integer, String> names = clubNames();
        List<Partida> matches = query.clubId() == null
                ? partidas.findAll()
                : partidas.findByMandanteClubeIdOrVisitanteClubeId(query.clubId(), query.clubId());
        return matches.stream()
                .sorted(Comparator.comparing(Partida::jogadoEm).thenComparing(Partida::id).reversed())
                .map(partida -> toSummary(partida, names.get(partida.mandanteClubeId()),
                        names.get(partida.visitanteClubeId())))
                .toList();
    }

    /**
     * RN21.2: a partida com os seis duelos na ordem da RN20.
     */
    @Transactional(readOnly = true)
    public MatchResponse get(String rawId) {
        int id = PathId.parse(rawId);
        Partida partida = partidas.findById(id)
                .orElseThrow(() -> ApiException.notFound("Partida não encontrada."));
        Map<Integer, String> names = clubNames();
        List<DuelResponse> duels = duelos.findByPartidaId(partida.id()).stream()
                .sorted(Comparator.comparing(Duelo::ordem))
                .map(this::toDuelResponse)
                .toList();
        return toResponse(partida, names.get(partida.mandanteClubeId()), names.get(partida.visitanteClubeId()), duels);
    }

    private Map<Integer, String> clubNames() {
        return clubes.findAll().stream()
                .collect(Collectors.toMap(Clube::id, Clube::nome));
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

    private Duelo toDuelo(Partida partida, DuelSnapshot duel) {
        DuelistSnapshot attacker = duel.attacker();
        DuelistSnapshot defender = duel.defender();
        int attackingClubId = duel.order() <= 3 ? partida.mandanteClubeId() : partida.visitanteClubeId();
        return new Duelo(partida.id(), attackingClubId, duel.order(),
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
        return new DuelResponse(duelo.ordem(), duelo.clubeAtacanteId(), attacker, defender, duelo.gol());
    }

    private String attributeName(Attribute attribute) {
        return attribute.name().toLowerCase(Locale.ROOT);
    }

    private MatchSummaryResponse toSummary(Partida partida, String homeName, String awayName) {
        return new MatchSummaryResponse(partida.id(), partida.mandanteClubeId(), homeName, partida.visitanteClubeId(),
                awayName, partida.golsMandante(), partida.golsVisitante(), partida.resultado(),
                BrasiliaTime.format(partida.jogadoEm()), homeSide(partida, homeName), awaySide(partida, awayName));
    }

    private MatchResponse toResponse(Partida partida, String homeName, String awayName, List<DuelResponse> duels) {
        return new MatchResponse(partida.id(), partida.mandanteClubeId(), homeName, partida.visitanteClubeId(),
                awayName, partida.golsMandante(), partida.golsVisitante(), partida.resultado(),
                BrasiliaTime.format(partida.jogadoEm()), partida.formacaoMandante(), partida.formacaoVisitante(),
                duels, homeSide(partida, homeName), awaySide(partida, awayName));
    }

    private MatchSideResponse homeSide(Partida partida, String homeName) {
        return new MatchSideResponse(partida.mandanteClubeId(), homeName, partida.formacaoMandante(),
                partida.golsMandante());
    }

    private MatchSideResponse awaySide(Partida partida, String awayName) {
        return new MatchSideResponse(partida.visitanteClubeId(), awayName, partida.formacaoVisitante(),
                partida.golsVisitante());
    }
}
