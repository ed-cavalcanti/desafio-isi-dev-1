package com.app.service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.api.ApiException;
import com.app.api.ClubRequest;
import com.app.api.ClubRequestValidator;
import com.app.api.ClubResponse;
import com.app.api.ClubSort;
import com.app.mapper.ClubMapper;
import com.app.mapper.PlayerMapper;
import com.app.model.NameOrder;
import com.app.persistence.Clube;
import com.app.persistence.ClubeRepository;
import com.app.persistence.Jogador;
import com.app.persistence.JogadorRepository;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * Cadastro e listagem de clubes. O clube nasce com 300,00 em caixa (RN10) e o
 * valor do elenco e o patrimônio são calculados a cada consulta (RN11).
 */
@Service
public class ClubService {

    private static final int MAX_CLUBS = 20;

    private final ClubRequestValidator validator;
    private final ClubMapper mapper;
    private final PlayerMapper playerMapper;
    private final ClubeRepository clubes;
    private final JogadorRepository jogadores;

    public ClubService(ClubRequestValidator validator, ClubMapper mapper, PlayerMapper playerMapper,
            ClubeRepository clubes, JogadorRepository jogadores) {
        this.validator = validator;
        this.mapper = mapper;
        this.playerMapper = playerMapper;
        this.clubes = clubes;
        this.jogadores = jogadores;
    }

    @Transactional
    public ClubResponse create(JsonNode body) {
        ClubRequest request = validator.create(body);
        if (clubes.existsByNomeBusca(mapper.searchKey(request.name()))) {
            throw ApiException.conflict("Já existe um clube com esse nome.");
        }
        if (clubes.existsBySigla(request.acronym())) {
            throw ApiException.conflict("Já existe um clube com essa sigla.");
        }
        if (clubes.count() >= MAX_CLUBS) {
            throw ApiException.conflict("A liga já aceita no máximo 20 clubes.");
        }
        Clube created = clubes.save(mapper.toEntity(request));
        return mapper.toResponse(created, BigDecimal.ZERO.setScale(2));
    }

    @Transactional(readOnly = true)
    public List<ClubResponse> list(ClubSort sort) {
        Map<Integer, BigDecimal> squadValues = squadValues();
        return clubes.findAll().stream()
                .map(clube -> mapper.toResponse(clube, squadValues.getOrDefault(clube.id(), BigDecimal.ZERO)))
                .sorted(comparator(sort))
                .toList();
    }

    private Map<Integer, BigDecimal> squadValues() {
        Map<Integer, BigDecimal> squadValues = new HashMap<>();
        for (Jogador jogador : jogadores.findByExcluidoEmIsNull()) {
            if (jogador.clubeId() != null) {
                squadValues.merge(jogador.clubeId(), playerMapper.toResponse(jogador).marketValue(), BigDecimal::add);
            }
        }
        return squadValues;
    }

    private Comparator<ClubResponse> comparator(ClubSort sort) {
        return sort.comparator()
                .thenComparing((ClubResponse club) -> NameOrder.sortKey(club.name()))
                .thenComparing(ClubResponse::id);
    }
}
