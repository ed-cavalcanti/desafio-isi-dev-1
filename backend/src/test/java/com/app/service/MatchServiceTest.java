package com.app.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.app.api.ApiException;
import com.app.api.DuelResponse;
import com.app.api.LineupRequestValidator;
import com.app.api.MatchRequestValidator;
import com.app.api.MatchResponse;
import com.app.mapper.PlayerMapper;
import com.app.model.Condition;
import com.app.model.MatchOutcome;
import com.app.model.Position;
import com.app.persistence.Clube;
import com.app.persistence.ClubeRepository;
import com.app.persistence.Duelo;
import com.app.persistence.DueloRepository;
import com.app.persistence.Escalacao;
import com.app.persistence.EscalacaoRepository;
import com.app.persistence.EscalacaoTitular;
import com.app.persistence.EscalacaoTitularRepository;
import com.app.persistence.Jogador;
import com.app.persistence.JogadorRepository;
import com.app.persistence.Partida;
import com.app.persistence.PartidaRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

@ExtendWith(MockitoExtension.class)
class MatchServiceTest {

    private final ObjectMapper JSON = new ObjectMapper();

    @Mock
    private ClubeRepository clubes;

    @Mock
    private JogadorRepository jogadores;

    @Mock
    private EscalacaoRepository escalacoes;

    @Mock
    private EscalacaoTitularRepository titulares;

    @Mock
    private PartidaRepository partidas;

    @Mock
    private DueloRepository duelos;

    private MatchService service;

    @BeforeEach
    void setUp() {
        LineupService lineups = new LineupService(new LineupRequestValidator(), new PlayerMapper(), clubes,
                jogadores, escalacoes, titulares);
        service = new MatchService(new MatchRequestValidator(), lineups, clubes, partidas, duelos);
    }

    private Jogador jogador(int id, String name, Position position, Condition condition, int shooting, int passing,
            int dribbling, int defending) {
        Jogador jogador = new Jogador();
        jogador.nome(name);
        jogador.posicao(position);
        jogador.agilidade(50);
        jogador.idade(25);
        jogador.valorBase(new BigDecimal("36.00"));
        jogador.condicao(condition);
        jogador.clubeId(id < 40 ? 1 : 2);
        jogador.velocidade(50);
        jogador.finalizacao(shooting);
        jogador.passe(passing);
        jogador.drible(dribbling);
        jogador.defesa(defending);
        jogador.fisico(50);
        jogador.potencial(80);
        ReflectionTestUtils.setField(jogador, "id", id);
        return jogador;
    }

    private void stubTeam(int clubId, String clubName, int escalacaoId, Jogador... players) {
        Clube clube = new Clube();
        clube.nome(clubName);
        clube.nomeBusca(clubName.toLowerCase());
        clube.sigla("C" + clubId + "C");
        clube.caixa(new BigDecimal("300.00"));
        ReflectionTestUtils.setField(clube, "id", clubId);
        when(clubes.findById(clubId)).thenReturn(Optional.of(clube));

        Escalacao escalacao = new Escalacao();
        escalacao.clubeId(clubId);
        escalacao.formacao("2-1-1");
        ReflectionTestUtils.setField(escalacao, "id", escalacaoId);
        when(escalacoes.findByClubeId(clubId)).thenReturn(Optional.of(escalacao));

        List<EscalacaoTitular> rows = new ArrayList<>();
        for (Jogador player : players) {
            rows.add(new EscalacaoTitular(escalacaoId, player.id()));
            when(jogadores.findByIdAndExcluidoEmIsNull(player.id())).thenReturn(Optional.of(player));
        }
        when(titulares.findByEscalacaoId(escalacaoId)).thenReturn(rows);
    }

    private void stubExampleTeams() {
        stubTeam(1, "Águias FC", 7,
                jogador(30, "Rui Prado", Position.GOL, Condition.APTO, 50, 50, 50, 77),
                jogador(32, "Téo Brandão", Position.ZAG, Condition.APTO, 50, 50, 50, 84),
                jogador(31, "Davi Lins", Position.LAT, Condition.MAL_CONDICIONADO, 50, 50, 74, 66),
                jogador(33, "Lauro Neves", Position.MEI, Condition.APTO, 50, 82, 50, 50),
                jogador(34, "Otto Rangel", Position.ATA, Condition.APTO, 75, 50, 50, 50));
        stubTeam(2, "Delta FC", 8,
                jogador(40, "Ivo Teles", Position.GOL, Condition.APTO, 50, 50, 50, 72),
                jogador(41, "Hugo Vaz", Position.ZAG, Condition.APTO, 50, 50, 50, 84),
                jogador(42, "Lino Matos", Position.LAT, Condition.APTO, 50, 50, 79, 63),
                jogador(43, "Nei Soares", Position.MEI, Condition.APTO, 50, 70, 50, 50),
                jogador(44, "Ugo Falcão", Position.ATA, Condition.APTO, 81, 50, 50, 50));
    }

    private ObjectNode body() {
        ObjectNode body = JSON.createObjectNode();
        body.put("home_club_id", 1);
        body.put("away_club_id", 2);
        return body;
    }

    @Test
    @DisplayName("joga a partida do exemplo da RN20 e grava o placar e os seis duelos")
    void playsMatch() {
        stubExampleTeams();
        when(partidas.save(any(Partida.class))).thenAnswer(invocation -> {
            Partida partida = invocation.getArgument(0);
            ReflectionTestUtils.setField(partida, "id", 15);
            return partida;
        });
        when(duelos.save(any(Duelo.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MatchResponse response = service.play(body());

        assertThat(response.id()).isEqualTo(15);
        assertThat(response.homeClubName()).isEqualTo("Águias FC");
        assertThat(response.awayClubName()).isEqualTo("Delta FC");
        assertThat(response.homeGoals()).isEqualTo(1);
        assertThat(response.awayGoals()).isEqualTo(2);
        assertThat(response.result()).isEqualTo(MatchOutcome.VISITANTE);
        assertThat(response.homeFormation()).isEqualTo("2-1-1");
        assertThat(response.awayFormation()).isEqualTo("2-1-1");
        assertThat(response.playedAt()).matches("\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}-03:00");
        assertThat(response.duels()).hasSize(6);
        assertThat(response.duels()).extracting(DuelResponse::order).containsExactly(1, 2, 3, 4, 5, 6);
        assertThat(response.duels().get(2).attacker().value()).isEqualTo(63);
        assertThat(response.duels().get(2).attacker().attribute()).isEqualTo("dribbling");
        assertThat(response.duels().get(5).defender().value()).isEqualTo(56);
        assertThat(response.duels().get(0).goal()).isTrue();
        assertThat(response.duels().get(3).goal()).isTrue();
        assertThat(response.duels().get(5).goal()).isTrue();

        ArgumentCaptor<Duelo> saved = ArgumentCaptor.forClass(Duelo.class);
        verify(duelos, times(6)).save(saved.capture());
        assertThat(saved.getAllValues()).allSatisfy(duelo -> assertThat(duelo.partidaId()).isEqualTo(15));
    }

    @Test
    @DisplayName("recusa partida sem escalação completa")
    void rejectsIncompleteLineups() {
        stubTeam(1, "Águias FC", 7,
                jogador(30, "Rui Prado", Position.GOL, Condition.APTO, 50, 50, 50, 77),
                jogador(32, "Téo Brandão", Position.ZAG, Condition.APTO, 50, 50, 50, 84),
                jogador(31, "Davi Lins", Position.LAT, Condition.APTO, 50, 50, 74, 66),
                jogador(33, "Lauro Neves", Position.MEI, Condition.APTO, 50, 82, 50, 50),
                jogador(34, "Otto Rangel", Position.ATA, Condition.APTO, 75, 50, 50, 50));
        Clube delta = new Clube();
        delta.nome("Delta FC");
        delta.nomeBusca("delta fc");
        delta.sigla("DFC");
        delta.caixa(new BigDecimal("300.00"));
        ReflectionTestUtils.setField(delta, "id", 2);
        when(clubes.findById(2)).thenReturn(Optional.of(delta));
        when(escalacoes.findByClubeId(2)).thenReturn(Optional.empty());

        ApiException exception = assertThrows(ApiException.class, () -> service.play(body()));

        assertThat(exception.status()).isEqualTo(409);
        verify(partidas, never()).save(any(Partida.class));
    }

    @Test
    @DisplayName("responde 404 para clube inexistente")
    void returnsNotFound() {
        when(clubes.findById(9)).thenReturn(Optional.empty());
        ObjectNode body = JSON.createObjectNode();
        body.put("home_club_id", 9);
        body.put("away_club_id", 2);

        assertThat(assertThrows(ApiException.class, () -> service.play(body)).status()).isEqualTo(404);
    }
}
