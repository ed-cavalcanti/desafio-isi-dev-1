package com.app.service;

import com.app.api.PlayerRequest;
import com.app.api.PlayerRequestValidator;
import com.app.api.PlayerResponse;
import com.app.mapper.PlayerMapper;
import com.app.model.PlayerCalculator;
import com.app.persistence.Jogador;
import com.app.persistence.JogadorRepository;
import com.fasterxml.jackson.databind.JsonNode;
import java.math.BigDecimal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Cadastro de jogadores. O valor base é calculado uma única vez, no cadastro,
 * e o overall e o valor de mercado são calculados a cada consulta.
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
        Jogador saved = jogadores.save(mapper.toEntity(request, baseValue));
        BigDecimal marketValue = PlayerCalculator.marketValue(saved.condicao(), saved.idade(), saved.agilidade(),
                saved.valorBase());
        return mapper.toResponse(saved, overall, marketValue);
    }
}
