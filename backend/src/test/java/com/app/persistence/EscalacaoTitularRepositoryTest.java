package com.app.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

import com.app.model.Condition;
import com.app.model.Position;

@DataJpaTest(properties = { "spring.jpa.hibernate.ddl-auto=create-drop", "spring.flyway.enabled=false" })
class EscalacaoTitularRepositoryTest {

    @Autowired
    private ClubeRepository clubes;

    @Autowired
    private JogadorRepository jogadores;

    @Autowired
    private EscalacaoRepository escalacoes;

    @Autowired
    private EscalacaoTitularRepository titulares;

    private Clube clube() {
        Clube clube = new Clube();
        clube.nome("Águias FC");
        clube.nomeBusca("águias fc");
        clube.sigla("AFC");
        clube.caixa(new BigDecimal("300.00"));
        clube.criadoEm(LocalDateTime.now());
        return clubes.save(clube);
    }

    private Jogador jogador(Clube clube) {
        Jogador jogador = new Jogador();
        jogador.nome("Meia Lua");
        jogador.posicao(Position.MEI);
        jogador.agilidade(50);
        jogador.idade(25);
        jogador.valorBase(new BigDecimal("36.00"));
        jogador.condicao(Condition.APTO);
        jogador.clubeId(clube.id());
        jogador.velocidade(68);
        jogador.finalizacao(65);
        jogador.passe(80);
        jogador.drible(78);
        jogador.defesa(52);
        jogador.fisico(60);
        jogador.potencial(86);
        LocalDateTime now = LocalDateTime.now();
        jogador.criadoEm(now);
        jogador.atualizadoEm(now);
        return jogadores.save(jogador);
    }

    private Escalacao escalacao(Clube clube) {
        Escalacao escalacao = new Escalacao();
        escalacao.clubeId(clube.id());
        escalacao.formacao("2-1-1");
        escalacao.atualizadoEm(LocalDateTime.now());
        return escalacoes.save(escalacao);
    }

    @Test
    @DisplayName("substitui a escalação reutilizando os mesmos titulares")
    void replacesTitularesKeepingTheSamePlayers() {
        Clube clube = clube();
        Jogador jogador = jogador(clube);
        Escalacao escalacao = escalacao(clube);
        titulares.save(new EscalacaoTitular(escalacao.id(), jogador.id()));

        titulares.deleteByEscalacaoId(escalacao.id());
        titulares.save(new EscalacaoTitular(escalacao.id(), jogador.id()));

        assertThat(titulares.findByEscalacaoId(escalacao.id())).hasSize(1);
    }

    @Test
    @DisplayName("remove o titular pelo jogador")
    void removesTitularByPlayer() {
        Clube clube = clube();
        Jogador jogador = jogador(clube);
        Escalacao escalacao = escalacao(clube);
        titulares.save(new EscalacaoTitular(escalacao.id(), jogador.id()));

        titulares.deleteByJogadorId(jogador.id());

        assertThat(titulares.findByEscalacaoId(escalacao.id())).isEmpty();
    }

    @Test
    @DisplayName("não aceita o mesmo titular duas vezes na escalação")
    void rejectsDuplicateTitular() {
        Clube clube = clube();
        Jogador jogador = jogador(clube);
        Escalacao escalacao = escalacao(clube);
        titulares.save(new EscalacaoTitular(escalacao.id(), jogador.id()));
        titulares.flush();

        assertThrows(DataIntegrityViolationException.class, () -> {
            titulares.save(new EscalacaoTitular(escalacao.id(), jogador.id()));
            titulares.flush();
        });
    }
}
