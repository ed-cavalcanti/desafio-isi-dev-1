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
class EscalacaoRepositoryTest {

    @Autowired
    private ClubeRepository clubes;

    @Autowired
    private JogadorRepository jogadores;

    @Autowired
    private EscalacaoRepository escalacoes;

    private Clube club(String name, String acronym) {
        Clube clube = new Clube();
        clube.nome(name);
        clube.nomeBusca(name.toLowerCase());
        clube.sigla(acronym);
        clube.caixa(new BigDecimal("300.00"));
        clube.criadoEm(LocalDateTime.now());
        return clubes.save(clube);
    }

    private Jogador player(Clube clube) {
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

    @Test
    @DisplayName("grava e remove titulares pela chave composta clube e jogador")
    void storesAndRemovesTitulares() {
        Clube clube = club("Águias FC", "AFC");
        Jogador jogador = player(clube);

        escalacoes.saveAndFlush(new Escalacao(clube.id(), jogador.id(), LocalDateTime.now()));

        assertThat(escalacoes.findByClubeId(clube.id())).hasSize(1);

        escalacoes.deleteByJogadorId(jogador.id());

        assertThat(escalacoes.findByClubeId(clube.id())).isEmpty();
    }

    @Test
    @DisplayName("mantém uma única linha para o mesmo clube e jogador")
    void keepsOneRowForSameClubAndPlayer() {
        Clube clube = club("Águias FC", "AFC");
        Jogador jogador = player(clube);
        escalacoes.saveAndFlush(new Escalacao(clube.id(), jogador.id(), LocalDateTime.now()));

        escalacoes.saveAndFlush(new Escalacao(clube.id(), jogador.id(), LocalDateTime.now()));

        assertThat(escalacoes.findByClubeId(clube.id())).hasSize(1);
    }

    @Test
    @DisplayName("não aceita o mesmo jogador em duas escalações")
    void rejectsPlayerInTwoLineups() {
        Clube alfa = club("Alfa FC", "AFC");
        Clube beta = club("Beta FC", "BFC");
        Jogador jogador = player(alfa);

        escalacoes.saveAndFlush(new Escalacao(alfa.id(), jogador.id(), LocalDateTime.now()));

        assertThrows(DataIntegrityViolationException.class, () -> {
            escalacoes.saveAndFlush(new Escalacao(beta.id(), jogador.id(), LocalDateTime.now()));
        });
    }
}
