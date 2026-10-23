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
import com.app.api.PlayerUpdateRequest;
import com.app.mapper.PlayerMapper;
import com.app.model.BrasiliaTime;
import com.app.model.Condition;
import com.app.model.NameOrder;
import com.app.model.PlayerCalculator;
import com.app.persistence.ClubeRepository;
import com.app.persistence.Jogador;
import com.app.persistence.JogadorRepository;
import com.fasterxml.jackson.databind.JsonNode;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Cadastro, consulta, edição, condição e exclusão de jogadores. O valor base é
 * calculado uma única vez, no cadastro, e o overall e o valor de mercado são
 * calculados a cada consulta.
 */
@Service
public class PlayerService {

    private final PlayerRequestValidator validator;
    private final PlayerMapper mapper;
    private final ClubeRepository clubes;
    private final JogadorRepository jogadores;
    private final LineupService lineups;

    public PlayerService(PlayerRequestValidator validator, PlayerMapper mapper, ClubeRepository clubes,
            JogadorRepository jogadores, LineupService lineups) {
        this.validator = validator;
        this.mapper = mapper;
        this.clubes = clubes;
        this.jogadores = jogadores;
        this.lineups = lineups;
    }

    @Transactional
    public PlayerResponse create(JsonNode body) {
        PlayerRequest request = validator.create(body);
        int overall = PlayerCalculator.overall(request.position(), request.attributes());
        BigDecimal baseValue = PlayerCalculator.baseValue(overall, request.age(), request.attributes().potential());
        return mapper.toResponse(jogadores.save(mapper.toEntity(request, baseValue)));
    }

    @Transactional(readOnly = true)
    public PlayerResponse get(String rawId) {
        int id = PathId.parse(rawId);
        Jogador jogador = findActive(id);
        return mapper.toResponse(jogador);
    }

    /**
     * RN08: muda só nome, posição, agilidade e idade; indicadores, potencial e
     * valor base continuam os do cadastro.
     */
    @Transactional
    public PlayerResponse update(String rawId, JsonNode body) {
        int id = PathId.parse(rawId);
        PlayerUpdateRequest request = validator.update(body);
        Jogador jogador = findActive(id);
        if (jogador.clubeId() != null && jogador.posicao() != request.position()) {
            throw ApiException.conflict("Jogador com clube não muda de posição.");
        }
        if (request.age() < jogador.idade()) {
            throw ApiException.conflict("A idade do jogador não pode diminuir.");
        }
        jogador.nome(request.name());
        jogador.posicao(request.position());
        jogador.agilidade(request.agility());
        jogador.idade(request.age());
        jogador.atualizadoEm(BrasiliaTime.now());
        return mapper.toResponse(jogadores.save(jogador));
    }

    /**
     * RN02: muda a condição física; de DOENTE não vai direto para APTO e enviar
     * a condição atual é aceito, sem mudança. Titular que passa a DOENTE sai da
     * escalação (RN19.5).
     */
    @Transactional
    public PlayerResponse changeCondition(String rawId, JsonNode body) {
        int id = PathId.parse(rawId);
        Condition condition = validator.condition(body);
        Jogador jogador = findActive(id);
        if (jogador.condicao() == Condition.DOENTE && condition == Condition.APTO) {
            throw ApiException.conflict("Jogador DOENTE não muda direto para APTO.");
        }
        jogador.condicao(condition);
        jogador.atualizadoEm(BrasiliaTime.now());
        if (condition == Condition.DOENTE) {
            lineups.removeTitular(id);
        }
        return mapper.toResponse(jogadores.save(jogador));
    }

    /**
     * RN09: exclusão lógica de jogador livre; nada é apagado do banco.
     */
    @Transactional
    public void delete(String rawId) {
        int id = PathId.parse(rawId);
        Jogador jogador = findActive(id);
        if (jogador.clubeId() != null) {
            throw ApiException.conflict("Jogador no elenco de um clube não pode ser excluído.");
        }
        LocalDateTime now = BrasiliaTime.now();
        jogador.excluidoEm(now);
        jogador.atualizadoEm(now);
        jogadores.save(jogador);
    }

    private Jogador findActive(int id) {
        return jogadores.findByIdAndExcluidoEmIsNull(id)
                .orElseThrow(() -> ApiException.notFound("Jogador não encontrado."));
    }

    @Transactional(readOnly = true)
    public PlayerPageResponse list(PlayerListQuery query) {
        if (query.clubId() != null && !clubes.existsById(query.clubId())) {
            throw ApiException.notFound("Clube não encontrado.");
        }
        List<PlayerResponse> filtered = jogadores.findByExcluidoEmIsNull().stream()
                .map(mapper::toResponse)
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
}
