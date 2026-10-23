package com.app.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
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
import com.app.api.LineupRequestValidator;
import com.app.api.LineupResponse;
import com.app.api.PlayerResponse;
import com.app.mapper.PlayerMapper;
import com.app.model.Condition;
import com.app.model.Position;
import com.app.persistence.Clube;
import com.app.persistence.ClubeRepository;
import com.app.persistence.Escalacao;
import com.app.persistence.EscalacaoRepository;
import com.app.persistence.EscalacaoTitular;
import com.app.persistence.EscalacaoTitularRepository;
import com.app.persistence.Jogador;
import com.app.persistence.JogadorRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

@ExtendWith(MockitoExtension.class)
class LineupServiceTest {

    private final ObjectMapper JSON = new ObjectMapper();
    private final LineupRequestValidator validator = new LineupRequestValidator();
    private final PlayerMapper playerMapper = new PlayerMapper();

    @Mock
    private ClubeRepository clubes;

    @Mock
    private JogadorRepository jogadores;

    @Mock
    private EscalacaoRepository escalacoes;

    @Mock
    private EscalacaoTitularRepository titulares;

    private LineupService service;

    @BeforeEach
    void setUp() {
        service = new LineupService(validator, playerMapper, clubes, jogadores, escalacoes, titulares);
    }

    private Clube club(int id) {
        Clube clube = new Clube();
        clube.nome("Águias FC");
        clube.nomeBusca("águias fc");
        clube.sigla("AFC");
        clube.caixa(new BigDecimal("300.00"));
        ReflectionTestUtils.setField(clube, "id", id);
        return clube;
    }

    private Jogador player(int id, String name, Position position, Condition condition, Integer clubId) {
        Jogador jogador = new Jogador();
        jogador.nome(name);
        jogador.posicao(position);
        jogador.agilidade(50);
        jogador.idade(25);
        jogador.valorBase(new BigDecimal("36.00"));
        jogador.condicao(condition);
        jogador.clubeId(clubId);
        jogador.velocidade(68);
        jogador.finalizacao(65);
        jogador.passe(80);
        jogador.drible(78);
        jogador.defesa(52);
        jogador.fisico(60);
        jogador.potencial(86);
        ReflectionTestUtils.setField(jogador, "id", id);
        return jogador;
    }

    private Escalacao escalacao(int id, int clubId, String formation) {
        Escalacao escalacao = new Escalacao();
        escalacao.clubeId(clubId);
        escalacao.formacao(formation);
        ReflectionTestUtils.setField(escalacao, "id", id);
        return escalacao;
    }

    private ObjectNode body(String formation, int... playerIds) {
        ObjectNode body = JSON.createObjectNode();
        body.put("formation", formation);
        for (int playerId : playerIds) {
            body.withArray("player_ids").add(playerId);
        }
        return body;
    }

    private void stubPlayers(Jogador... players) {
        for (Jogador player : players) {
            when(jogadores.findByIdAndExcluidoEmIsNull(player.id())).thenReturn(Optional.of(player));
        }
    }

    @Test
    @DisplayName("grava a escalação completa e devolve os titulares na ordem do elenco")
    void putsValidLineup() {
        Jogador gol = player(1, "Rui Prado", Position.GOL, Condition.APTO, 1);
        Jogador zag = player(2, "Téo Brandão", Position.ZAG, Condition.APTO, 1);
        Jogador lat = player(3, "Davi Lins", Position.LAT, Condition.MAL_CONDICIONADO, 1);
        Jogador mei = player(4, "Lauro Neves", Position.MEI, Condition.APTO, 1);
        Jogador ata = player(5, "Otto Rangel", Position.ATA, Condition.APTO, 1);
        stubPlayers(gol, zag, lat, mei, ata);
        when(clubes.findById(1)).thenReturn(Optional.of(club(1)));
        when(escalacoes.findByClubeId(1)).thenReturn(Optional.empty());
        when(escalacoes.save(any(Escalacao.class))).thenAnswer(invocation -> {
            Escalacao saved = invocation.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", 7);
            return saved;
        });

        LineupResponse response = service.put("1", body("2-1-1", 5, 3, 1, 4, 2));

        assertThat(response.clubId()).isEqualTo(1);
        assertThat(response.formation()).isEqualTo("2-1-1");
        assertThat(response.complete()).isTrue();
        assertThat(response.players()).extracting(PlayerResponse::id).containsExactly(1, 2, 3, 4, 5);
        verify(titulares).deleteByEscalacaoId(7);
        ArgumentCaptor<EscalacaoTitular> saved = ArgumentCaptor.forClass(EscalacaoTitular.class);
        verify(titulares, times(5)).save(saved.capture());
        assertThat(saved.getAllValues()).extracting(EscalacaoTitular::jogadorId)
                .containsExactlyInAnyOrder(1, 2, 3, 4, 5);
    }

    @Test
    @DisplayName("recusa titular de outro clube, titular DOENTE e formação que não fecha")
    void rejectsInvalidStarters() {
        Jogador outside = player(2, "Téo Brandão", Position.ZAG, Condition.APTO, 2);
        stubPlayers(player(1, "Rui Prado", Position.GOL, Condition.APTO, 1), outside,
                player(3, "Davi Lins", Position.LAT, Condition.APTO, 1),
                player(4, "Lauro Neves", Position.MEI, Condition.APTO, 1),
                player(5, "Otto Rangel", Position.ATA, Condition.APTO, 1));
        when(clubes.findById(1)).thenReturn(Optional.of(club(1)));

        ApiException otherClub = assertThrows(ApiException.class,
                () -> service.put("1", body("2-1-1", 1, 2, 3, 4, 5)));
        assertThat(otherClub.status()).isEqualTo(409);

        stubPlayers(player(6, "Bia Reis", Position.ZAG, Condition.DOENTE, 1));
        ApiException sick = assertThrows(ApiException.class,
                () -> service.put("1", body("2-1-1", 1, 6, 3, 4, 5)));
        assertThat(sick.status()).isEqualTo(409);

        stubPlayers(player(7, "Caio Reis", Position.ZAG, Condition.APTO, 1));
        ApiException formation = assertThrows(ApiException.class,
                () -> service.put("1", body("3-1", 1, 7, 3, 4, 5)));
        assertThat(formation.status()).isEqualTo(409);
    }

    @Test
    @DisplayName("responde 404 para clube ou jogador inexistente")
    void returnsNotFound() {
        when(clubes.findById(99)).thenReturn(Optional.empty());
        assertThat(assertThrows(ApiException.class, () -> service.put("99", body("2-1-1", 1, 2, 3, 4, 5))).status())
                .isEqualTo(404);
        assertThat(assertThrows(ApiException.class, () -> service.get("99")).status()).isEqualTo(404);

        when(clubes.findById(1)).thenReturn(Optional.of(club(1)));
        when(jogadores.findByIdAndExcluidoEmIsNull(1)).thenReturn(Optional.empty());
        assertThat(assertThrows(ApiException.class, () -> service.put("1", body("2-1-1", 1, 2, 3, 4, 5))).status())
                .isEqualTo(404);
    }

    @Test
    @DisplayName("sem escalação, devolve formação nula e lista vazia")
    void getsEmptyLineup() {
        when(clubes.findById(1)).thenReturn(Optional.of(club(1)));
        when(escalacoes.findByClubeId(1)).thenReturn(Optional.empty());

        LineupResponse response = service.get("1");

        assertThat(response.formation()).isNull();
        assertThat(response.players()).isEmpty();
        assertThat(response.complete()).isFalse();
    }

    @Test
    @DisplayName("com titular removido, mantém a formação e marca a escalação como incompleta")
    void getsIncompleteLineup() {
        when(clubes.findById(1)).thenReturn(Optional.of(club(1)));
        when(escalacoes.findByClubeId(1)).thenReturn(Optional.of(escalacao(7, 1, "2-1-1")));
        when(titulares.findByEscalacaoId(7)).thenReturn(List.of(
                new EscalacaoTitular(7, 1), new EscalacaoTitular(7, 2), new EscalacaoTitular(7, 3),
                new EscalacaoTitular(7, 5)));
        stubPlayers(
                player(1, "Rui Prado", Position.GOL, Condition.APTO, 1),
                player(2, "Téo Brandão", Position.ZAG, Condition.APTO, 1),
                player(3, "Davi Lins", Position.LAT, Condition.APTO, 1),
                player(5, "Otto Rangel", Position.ATA, Condition.APTO, 1));

        LineupResponse response = service.get("1");

        assertThat(response.formation()).isEqualTo("2-1-1");
        assertThat(response.complete()).isFalse();
        assertThat(response.players()).extracting(PlayerResponse::id).containsExactly(1, 2, 3, 5);
    }

    @Test
    @DisplayName("titular vendido ou DOENTE é removido da escalação")
    void removesTitular() {
        service.removeTitular(4);

        verify(titulares).deleteByJogadorId(4);
    }
}
