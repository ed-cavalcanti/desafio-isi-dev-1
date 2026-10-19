package com.app.service;

import com.app.api.ApiException;
import com.app.api.PageMeta;
import com.app.api.PathId;
import com.app.api.PlayerListQuery;
import com.app.api.PlayerPageResponse;
import com.app.api.PlayerRequest;
import com.app.api.PlayerRequestValidator;
import com.app.api.PlayerResponse;
import com.app.api.PlayerSort;
import com.app.mapper.PlayerMapper;
import com.app.model.NameOrder;
import com.app.model.PlayerCalculator;
import com.app.persistence.Jogador;
import com.app.persistence.JogadorRepository;
import com.fasterxml.jackson.databind.JsonNode;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Cadastro e listagem de jogadores. O valor base é calculado uma única vez, no
 * cadastro, e o overall e o valor de mercado são calculados a cada consulta.
 */
@Service
public class PlayerService {

    private final PlayerRequestValidator validator;
    private final PlayerMapper mapper;
    private final JogadorRepository jogadores;

    public PlayerService(PlayerRequestValidator validator, PlayerMapper mapper, JogadorRepository jogadores) {
        this.validator = validator;
        this.mapper = mapper;
        this.jogadores = jogadores;
    }

    @Transactional
    public PlayerResponse create(JsonNode body) {
        PlayerRequest request = validator.create(body);
        int overall = PlayerCalculator.overall(request.position(), request.attributes());
        BigDecimal baseValue = PlayerCalculator.baseValue(overall, request.age(), request.attributes().potential());
        return toResponse(jogadores.save(mapper.toEntity(request, baseValue)));
    }

    @Transactional(readOnly = true)
    public PlayerResponse get(String rawId) {
        int id = PathId.parse(rawId);
        Jogador jogador = jogadores.findByIdAndExcluidoEmIsNull(id)
                .orElseThrow(() -> ApiException.notFound("Jogador não encontrado."));
        return toResponse(jogador);
    }

    @Transactional(readOnly = true)
    public PlayerPageResponse list(PlayerListQuery query) {
        List<Jogador> all = jogadores.findByExcluidoEmIsNull();
        if (query.clubId() != null && all.stream().noneMatch(jogador -> query.clubId().equals(jogador.clubeId()))) {
            throw ApiException.notFound("Clube não encontrado.");
        }
        List<PlayerResponse> filtered = all.stream()
                .map(this::toResponse)
                .filter(player -> matches(player, query))
                .sorted(comparator(query))
                .toList();

        int totalItems = filtered.size();
        int totalPages = totalItems == 0 ? 0 : (totalItems + query.limit() - 1) / query.limit();
        return new PlayerPageResponse(page(filtered, query),
                new PageMeta(query.page(), query.limit(), totalItems, totalPages));
    }

    private boolean matches(PlayerResponse player, PlayerListQuery query) {
        if (query.search() != null
                && !NameOrder.sortKey(player.name()).contains(NameOrder.sortKey(query.search()))) {
            return false;
        }
        if (query.position() != null && !query.position().name().equals(player.position())) {
            return false;
        }
        if (query.condition() != null && !query.condition().name().equals(player.condition())) {
            return false;
        }
        if (query.free() != null && query.free().booleanValue() != (player.clubId() == null)) {
            return false;
        }
        if (query.clubId() != null && !query.clubId().equals(player.clubId())) {
            return false;
        }
        if (player.age() < query.minAge() || player.age() > query.maxAge()) {
            return false;
        }
        return player.marketValue().compareTo(query.minValue()) >= 0
                && player.marketValue().compareTo(query.maxValue()) <= 0;
    }

    private Comparator<PlayerResponse> comparator(PlayerListQuery query) {
        Comparator<PlayerResponse> comparator = (first, second) -> 0;
        for (PlayerSort sort : query.sort()) {
            comparator = comparator.thenComparing(sort.comparator());
        }
        return comparator
                .thenComparing((PlayerResponse player) -> NameOrder.sortKey(player.name()))
                .thenComparing(PlayerResponse::id);
    }

    private List<PlayerResponse> page(List<PlayerResponse> all, PlayerListQuery query) {
        long from = (long) (query.page() - 1) * query.limit();
        if (from >= all.size()) {
            return List.of();
        }
        int to = (int) Math.min(from + query.limit(), all.size());
        return List.copyOf(all.subList((int) from, to));
    }

    private PlayerResponse toResponse(Jogador jogador) {
        int overall = PlayerCalculator.overall(jogador.posicao(), jogador.attributes());
        BigDecimal marketValue = PlayerCalculator.marketValue(jogador.condicao(), jogador.idade(),
                jogador.agilidade(), jogador.valorBase());
        return mapper.toResponse(jogador, overall, marketValue);
    }
}
