package com.app.service;

import com.app.api.PageMeta;
import com.app.api.PlayerListQuery;
import com.app.api.PlayerPageResponse;
import com.app.api.PlayerRequest;
import com.app.api.PlayerRequestValidator;
import com.app.api.PlayerResponse;
import com.app.mapper.PlayerMapper;
import com.app.model.NameOrder;
import com.app.model.PlayerCalculator;
import com.app.persistence.Jogador;
import com.app.persistence.JogadorRepository;
import com.fasterxml.jackson.databind.JsonNode;
import java.math.BigDecimal;
import java.util.ArrayList;
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

    private static final Comparator<Jogador> NAME_ORDER = Comparator
            .comparing((Jogador jogador) -> NameOrder.sortKey(jogador.nome()))
            .thenComparing(Jogador::id);

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
    public PlayerPageResponse list(PlayerListQuery query) {
        List<Jogador> all = new ArrayList<>(jogadores.findByExcluidoEmIsNull());
        all.sort(NAME_ORDER);

        int totalItems = all.size();
        int totalPages = totalItems == 0 ? 0 : (totalItems + query.limit() - 1) / query.limit();
        List<PlayerResponse> data = page(all, query).stream()
                .map(this::toResponse)
                .toList();
        return new PlayerPageResponse(data, new PageMeta(query.page(), query.limit(), totalItems, totalPages));
    }

    private List<Jogador> page(List<Jogador> all, PlayerListQuery query) {
        long from = (long) (query.page() - 1) * query.limit();
        if (from >= all.size()) {
            return List.of();
        }
        int to = (int) Math.min(from + query.limit(), all.size());
        return all.subList((int) from, to);
    }

    private PlayerResponse toResponse(Jogador jogador) {
        int overall = PlayerCalculator.overall(jogador.posicao(), jogador.attributes());
        BigDecimal marketValue = PlayerCalculator.marketValue(jogador.condicao(), jogador.idade(),
                jogador.agilidade(), jogador.valorBase());
        return mapper.toResponse(jogador, overall, marketValue);
    }
}
