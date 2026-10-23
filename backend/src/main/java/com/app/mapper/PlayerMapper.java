package com.app.mapper;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.stereotype.Component;

import com.app.api.PlayerRequest;
import com.app.api.PlayerResponse;
import com.app.model.BrasiliaTime;
import com.app.model.Condition;
import com.app.model.PlayerAttributes;
import com.app.model.PlayerCalculator;
import com.app.persistence.Jogador;

/**
 * Tradução entre o jogador persistido ({@link Jogador}) e os contratos da API
 * ({@link PlayerRequest} e {@link PlayerResponse}), calculando na resposta o
 * overall e o valor de mercado (RN06 e RN05).
 */
@Component
public class PlayerMapper {

    public Jogador toEntity(PlayerRequest request, BigDecimal baseValue) {
        PlayerAttributes attributes = request.attributes();
        Jogador jogador = new Jogador();
        jogador.nome(request.name());
        jogador.posicao(request.position());
        jogador.agilidade(request.agility());
        jogador.idade(request.age());
        jogador.velocidade(attributes.pace());
        jogador.finalizacao(attributes.shooting());
        jogador.passe(attributes.passing());
        jogador.drible(attributes.dribbling());
        jogador.defesa(attributes.defending());
        jogador.fisico(attributes.physical());
        jogador.potencial(attributes.potential());
        jogador.condicao(Condition.APTO);
        jogador.clubeId(null);
        jogador.valorBase(baseValue);
        LocalDateTime now = BrasiliaTime.now();
        jogador.criadoEm(now);
        jogador.atualizadoEm(now);
        return jogador;
    }

    public PlayerResponse toResponse(Jogador jogador) {
        PlayerAttributes attributes = jogador.attributes();
        int overall = PlayerCalculator.overall(jogador.posicao(), attributes);
        BigDecimal marketValue = PlayerCalculator.marketValue(jogador.condicao(), jogador.idade(),
                jogador.agilidade(), jogador.valorBase());
        return new PlayerResponse(
                jogador.id(),
                jogador.nome(),
                jogador.posicao().name(),
                jogador.agilidade(),
                jogador.idade(),
                jogador.condicao().name(),
                jogador.valorBase(),
                marketValue,
                attributes.pace(),
                attributes.shooting(),
                attributes.passing(),
                attributes.dribbling(),
                attributes.defending(),
                attributes.physical(),
                attributes.potential(),
                overall,
                jogador.clubeId());
    }
}
