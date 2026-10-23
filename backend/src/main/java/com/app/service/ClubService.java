package com.app.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.api.ApiException;
import com.app.api.ClubDetailsResponse;
import com.app.api.ClubRequest;
import com.app.api.ClubRequestValidator;
import com.app.api.ClubResponse;
import com.app.api.ClubSort;
import com.app.api.ContractResponse;
import com.app.api.PathId;
import com.app.api.SquadPlayerResponse;
import com.app.mapper.ClubMapper;
import com.app.mapper.PlayerMapper;
import com.app.model.BrasiliaTime;
import com.app.model.ContractStatus;
import com.app.model.MarketCalculator;
import com.app.model.NameOrder;
import com.app.model.SquadOrder;
import com.app.persistence.Clube;
import com.app.persistence.ClubeRepository;
import com.app.persistence.Contrato;
import com.app.persistence.ContratoRepository;
import com.app.persistence.Jogador;
import com.app.persistence.JogadorRepository;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * Cadastro, listagem e consulta de clubes. O clube nasce com 300,00 em caixa
 * (RN10) e o valor do elenco e o patrimônio são calculados a cada consulta
 * (RN11).
 */
@Service
public class ClubService {

    private static final int MAX_CLUBS = 20;

    private final ClubRequestValidator validator;
    private final ClubMapper mapper;
    private final PlayerMapper playerMapper;
    private final ClubeRepository clubes;
    private final JogadorRepository jogadores;
    private final ContratoRepository contratos;

    public ClubService(ClubRequestValidator validator, ClubMapper mapper, PlayerMapper playerMapper,
            ClubeRepository clubes, JogadorRepository jogadores, ContratoRepository contratos) {
        this.validator = validator;
        this.mapper = mapper;
        this.playerMapper = playerMapper;
        this.clubes = clubes;
        this.jogadores = jogadores;
        this.contratos = contratos;
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

    /**
     * RN11: o elenco vem na ordem do elenco, com o contrato de cada jogador e o
     * valor do elenco e o patrimônio calculados a cada consulta.
     */
    @Transactional(readOnly = true)
    public ClubDetailsResponse get(String rawId) {
        int id = PathId.parse(rawId);
        Clube clube = clubes.findById(id)
                .orElseThrow(() -> ApiException.notFound("Clube não encontrado."));
        LocalDateTime now = BrasiliaTime.now();
        List<SquadPlayerResponse> players = squad(clube.id()).stream()
                .map(jogador -> new SquadPlayerResponse(playerMapper.toResponse(jogador), contract(jogador, now)))
                .toList();
        BigDecimal squadValue = players.stream()
                .map(player -> player.player().marketValue())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new ClubDetailsResponse(clube.id(), clube.nome(), clube.sigla(), clube.caixa(), squadValue,
                clube.caixa().add(squadValue), players);
    }

    private List<Jogador> squad(Integer clubId) {
        return jogadores.findByExcluidoEmIsNull().stream()
                .filter(jogador -> clubId.equals(jogador.clubeId()))
                .sorted(SquadOrder.comparator(Jogador::posicao, Jogador::nome, Jogador::id))
                .toList();
    }

    private ContractResponse contract(Jogador jogador, LocalDateTime now) {
        Contrato contrato = contratos.findByJogadorIdAndStatus(jogador.id(), ContractStatus.ATIVO).orElse(null);
        if (contrato == null) {
            return null;
        }
        int daysRemaining = MarketCalculator.daysRemaining(contrato.fidelidadeAte(), now);
        return new ContractResponse(BrasiliaTime.format(contrato.fidelidadeAte()), daysRemaining,
                MarketCalculator.penaltyPercent(daysRemaining));
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
