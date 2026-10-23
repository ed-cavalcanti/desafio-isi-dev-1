package com.app.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.api.ApiException;
import com.app.api.LineupRequest;
import com.app.api.LineupRequestValidator;
import com.app.api.LineupResponse;
import com.app.api.PathId;
import com.app.mapper.PlayerMapper;
import com.app.model.BrasiliaTime;
import com.app.model.Condition;
import com.app.model.Formation;
import com.app.model.SquadOrder;
import com.app.persistence.Clube;
import com.app.persistence.ClubeRepository;
import com.app.persistence.Escalacao;
import com.app.persistence.EscalacaoRepository;
import com.app.persistence.EscalacaoTitular;
import com.app.persistence.EscalacaoTitularRepository;
import com.app.persistence.Jogador;
import com.app.persistence.JogadorRepository;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * Escalação dos titulares do clube (RN19): cinco titulares com um goleiro e os
 * jogadores de linha de cada setor da formação.
 */
@Service
public class LineupService {

    private static final int TITULARES = 5;

    private final LineupRequestValidator validator;
    private final PlayerMapper playerMapper;
    private final ClubeRepository clubes;
    private final JogadorRepository jogadores;
    private final EscalacaoRepository escalacoes;
    private final EscalacaoTitularRepository titulares;

    public LineupService(LineupRequestValidator validator, PlayerMapper playerMapper, ClubeRepository clubes,
            JogadorRepository jogadores, EscalacaoRepository escalacoes, EscalacaoTitularRepository titulares) {
        this.validator = validator;
        this.playerMapper = playerMapper;
        this.clubes = clubes;
        this.jogadores = jogadores;
        this.escalacoes = escalacoes;
        this.titulares = titulares;
    }

    @Transactional
    public LineupResponse put(String rawId, JsonNode body) {
        int clubId = PathId.parse(rawId);
        LineupRequest request = validator.put(body);
        Clube clube = clubes.findById(clubId)
                .orElseThrow(() -> ApiException.notFound("Clube não encontrado."));
        List<Jogador> starters = starters(request);
        for (Jogador jogador : starters) {
            if (!clube.id().equals(jogador.clubeId()) || jogador.condicao() == Condition.DOENTE) {
                throw ApiException.conflict(
                        "Os titulares precisam ser do elenco do clube e não podem estar DOENTE.");
            }
        }
        if (!fits(request.formation(), starters)) {
            throw ApiException.conflict("As posições dos titulares não fecham a formação.");
        }
        Escalacao escalacao = escalacoes.findByClubeId(clube.id()).orElseGet(Escalacao::new);
        escalacao.clubeId(clube.id());
        escalacao.formacao(request.formation().code());
        escalacao.atualizadoEm(BrasiliaTime.now());
        Escalacao saved = escalacoes.save(escalacao);
        titulares.deleteByEscalacaoId(saved.id());
        for (Jogador jogador : starters) {
            titulares.save(new EscalacaoTitular(saved.id(), jogador.id()));
        }
        return lineup(clube, saved.formacao(), starters);
    }

    @Transactional(readOnly = true)
    public LineupResponse get(String rawId) {
        int clubId = PathId.parse(rawId);
        Clube clube = clubes.findById(clubId)
                .orElseThrow(() -> ApiException.notFound("Clube não encontrado."));
        Optional<Escalacao> escalacao = escalacoes.findByClubeId(clube.id());
        if (escalacao.isEmpty()) {
            return lineup(clube, null, List.of());
        }
        return lineup(clube, escalacao.get().formacao(), titulares(escalacao.get()));
    }

    /**
     * RN19.5: o titular sai da escalação quando é vendido ou passa a DOENTE.
     */
    @Transactional
    public void removeTitular(Integer jogadorId) {
        titulares.deleteByJogadorId(jogadorId);
    }

    private List<Jogador> starters(LineupRequest request) {
        List<Jogador> starters = new ArrayList<>();
        for (Integer playerId : request.playerIds()) {
            starters.add(jogadores.findByIdAndExcluidoEmIsNull(playerId)
                    .orElseThrow(() -> ApiException.notFound("Jogador não encontrado.")));
        }
        return starters;
    }

    private List<Jogador> titulares(Escalacao escalacao) {
        return titulares.findByEscalacaoId(escalacao.id()).stream()
                .map(titular -> jogadores.findByIdAndExcluidoEmIsNull(titular.jogadorId()))
                .flatMap(Optional::stream)
                .sorted(SquadOrder.comparator(Jogador::posicao, Jogador::nome, Jogador::id))
                .toList();
    }

    private boolean fits(Formation formation, List<Jogador> starters) {
        long goals = 0;
        long defense = 0;
        long midfield = 0;
        long attack = 0;
        for (Jogador jogador : starters) {
            switch (jogador.posicao()) {
                case GOL -> goals++;
                case ZAG, LAT -> defense++;
                case MEI -> midfield++;
                case ATA -> attack++;
            }
        }
        return goals == 1 && defense == formation.defense() && midfield == formation.midfield()
                && attack == formation.attack();
    }

    private LineupResponse lineup(Clube clube, String formation, List<Jogador> players) {
        List<Jogador> ordered = players.stream()
                .sorted(SquadOrder.comparator(Jogador::posicao, Jogador::nome, Jogador::id))
                .toList();
        return new LineupResponse(clube.id(), formation, ordered.size() == TITULARES,
                ordered.stream().map(playerMapper::toResponse).toList());
    }
}
