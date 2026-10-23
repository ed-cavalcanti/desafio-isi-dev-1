package com.app.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
import com.app.api.PurchaseRequestValidator;
import com.app.api.PurchaseResponse;
import com.app.api.SaleResponse;
import com.app.mapper.PlayerMapper;
import com.app.model.BrasiliaTime;
import com.app.model.Condition;
import com.app.model.ContractStatus;
import com.app.model.Position;
import com.app.model.TransactionType;
import com.app.persistence.Clube;
import com.app.persistence.ClubeRepository;
import com.app.persistence.Contrato;
import com.app.persistence.ContratoRepository;
import com.app.persistence.EscalacaoRepository;
import com.app.persistence.Jogador;
import com.app.persistence.JogadorRepository;
import com.app.persistence.Transacao;
import com.app.persistence.TransacaoRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

@ExtendWith(MockitoExtension.class)
class MarketServiceTest {

    private final ObjectMapper JSON = new ObjectMapper();
    private final PurchaseRequestValidator validator = new PurchaseRequestValidator();
    private final PlayerMapper playerMapper = new PlayerMapper();

    @Mock
    private ClubeRepository clubes;

    @Mock
    private JogadorRepository jogadores;

    @Mock
    private ContratoRepository contratos;

    @Mock
    private TransacaoRepository transacoes;

    @Mock
    private EscalacaoRepository escalacoes;

    private MarketService service;

    @BeforeEach
    void setUp() {
        LineupService lineups = new LineupService(new LineupRequestValidator(), playerMapper, clubes, jogadores,
                escalacoes);
        service = new MarketService(validator, playerMapper, clubes, jogadores, contratos, transacoes, lineups);
    }

    private String loyalty(long days) {
        return BrasiliaTime.now().plusDays(days)
                .format(DateTimeFormatter.ofPattern("uuuu-MM-dd'T'HH:mm")) + "-03:00";
    }

    private ObjectNode body(int clubId) {
        ObjectNode body = JSON.createObjectNode();
        body.put("club_id", clubId);
        body.put("loyalty_until", loyalty(30));
        return body;
    }

    private Clube club(int id, String cash) {
        Clube clube = new Clube();
        clube.nome("Águias FC");
        clube.nomeBusca("águias fc");
        clube.sigla("AFC");
        clube.caixa(new BigDecimal(cash));
        ReflectionTestUtils.setField(clube, "id", id);
        return clube;
    }

    private Jogador player(int id, Integer clubId, String baseValue) {
        Jogador jogador = new Jogador();
        jogador.nome("Meia Lua");
        jogador.posicao(Position.MEI);
        jogador.agilidade(50);
        jogador.idade(25);
        jogador.valorBase(new BigDecimal(baseValue));
        jogador.condicao(Condition.APTO);
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

    @Test
    @DisplayName("compra grava contrato e transação, desconta o caixa e devolve os valores")
    void purchasesFreePlayer() {
        when(jogadores.findByIdAndExcluidoEmIsNull(1)).thenReturn(Optional.of(player(1, null, "36.00")));
        when(clubes.findById(1)).thenReturn(Optional.of(club(1, "300.00")));
        when(jogadores.countByClubeId(1)).thenReturn(2L);
        when(jogadores.save(any(Jogador.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(clubes.save(any(Clube.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(transacoes.save(any(Transacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PurchaseResponse response = service.purchase("1", body(1));

        assertThat(response.playerName()).isEqualTo("Meia Lua");
        assertThat(response.type()).isEqualTo(TransactionType.COMPRA);
        assertThat(response.value()).isEqualByComparingTo("36.00");
        assertThat(response.fee()).isEqualByComparingTo("1.80");
        assertThat(response.totalCost()).isEqualByComparingTo("37.80");
        assertThat(response.cashChange()).isEqualByComparingTo("-37.80");
        assertThat(response.clubCash()).isEqualByComparingTo("262.20");
        assertThat(response.contract().status()).isEqualTo(ContractStatus.ATIVO);
        assertThat(response.contract().loyaltyUntil())
                .matches("\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}-03:00");

        ArgumentCaptor<Contrato> contract = ArgumentCaptor.forClass(Contrato.class);
        verify(contratos).save(contract.capture());
        assertThat(contract.getValue().status()).isEqualTo(ContractStatus.ATIVO);
        assertThat(contract.getValue().valorCompra()).isEqualByComparingTo("36.00");
        assertThat(contract.getValue().clubeId()).isEqualTo(1);

        ArgumentCaptor<Transacao> transaction = ArgumentCaptor.forClass(Transacao.class);
        verify(transacoes).save(transaction.capture());
        assertThat(transaction.getValue().tipo()).isEqualTo(TransactionType.COMPRA);
        assertThat(transaction.getValue().jogadorNome()).isEqualTo("Meia Lua");
        assertThat(transaction.getValue().valor()).isEqualByComparingTo("36.00");
        assertThat(transaction.getValue().taxa()).isEqualByComparingTo("1.80");
        assertThat(transaction.getValue().multa()).isEqualByComparingTo("0.00");
        assertThat(transaction.getValue().lucro()).isNull();
        assertThat(transaction.getValue().variacaoCaixa()).isEqualByComparingTo("-37.80");
    }

    @Test
    @DisplayName("não cobra taxa até 30,00 de valor de mercado")
    void chargesNoFeeUpToThirty() {
        when(jogadores.findByIdAndExcluidoEmIsNull(1)).thenReturn(Optional.of(player(1, null, "30.00")));
        when(clubes.findById(1)).thenReturn(Optional.of(club(1, "300.00")));
        when(transacoes.save(any(Transacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PurchaseResponse response = service.purchase("1", body(1));

        assertThat(response.fee()).isEqualByComparingTo("0.00");
        assertThat(response.totalCost()).isEqualByComparingTo("30.00");
    }

    @Test
    @DisplayName("aceita custo igual ao limite de 50% do caixa e recusa acima")
    void enforcesFiftyPercentCashLimit() {
        when(jogadores.findByIdAndExcluidoEmIsNull(1)).thenReturn(Optional.of(player(1, null, "47.62")));
        when(clubes.findById(1)).thenReturn(Optional.of(club(1, "100.00")));
        when(transacoes.save(any(Transacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertThat(service.purchase("1", body(1)).totalCost()).isEqualByComparingTo("50.00");

        when(jogadores.findByIdAndExcluidoEmIsNull(2)).thenReturn(Optional.of(player(2, null, "48.00")));
        ApiException exception = assertThrows(ApiException.class, () -> service.purchase("2", body(1)));

        assertThat(exception.status()).isEqualTo(409);
    }

    @Test
    @DisplayName("recusa jogador com clube e jogador que o clube já vendeu")
    void rejectsUnavailablePlayers() {
        when(jogadores.findByIdAndExcluidoEmIsNull(1)).thenReturn(Optional.of(player(1, 2, "36.00")));
        when(clubes.findById(1)).thenReturn(Optional.of(club(1, "300.00")));

        ApiException contracted = assertThrows(ApiException.class, () -> service.purchase("1", body(1)));
        assertThat(contracted.status()).isEqualTo(409);

        when(jogadores.findByIdAndExcluidoEmIsNull(3)).thenReturn(Optional.of(player(3, null, "36.00")));
        when(transacoes.existsByClubeIdAndJogadorIdAndTipo(1, 3, TransactionType.VENDA)).thenReturn(true);

        ApiException soldBefore = assertThrows(ApiException.class, () -> service.purchase("3", body(1)));
        assertThat(soldBefore.status()).isEqualTo(409);
        verify(transacoes, never()).save(any(Transacao.class));
    }

    @Test
    @DisplayName("recusa a compra que passaria de 12 jogadores no elenco")
    void rejectsSquadAboveTwelve() {
        when(jogadores.findByIdAndExcluidoEmIsNull(1)).thenReturn(Optional.of(player(1, null, "36.00")));
        when(clubes.findById(1)).thenReturn(Optional.of(club(1, "300.00")));
        when(jogadores.countByClubeId(1)).thenReturn(12L);

        ApiException exception = assertThrows(ApiException.class, () -> service.purchase("1", body(1)));

        assertThat(exception.status()).isEqualTo(409);
    }

    @Test
    @DisplayName("responde 404 para jogador ou clube inexistente")
    void returnsNotFound() {
        when(jogadores.findByIdAndExcluidoEmIsNull(9)).thenReturn(Optional.empty());
        assertThat(assertThrows(ApiException.class, () -> service.purchase("9", body(1))).status()).isEqualTo(404);

        when(jogadores.findByIdAndExcluidoEmIsNull(1)).thenReturn(Optional.of(player(1, null, "36.00")));
        when(clubes.findById(99)).thenReturn(Optional.empty());
        assertThat(assertThrows(ApiException.class, () -> service.purchase("1", body(99))).status()).isEqualTo(404);
    }

    @Test
    @DisplayName("data e hora do contrato seguem o formato de resposta da RN01")
    void formatsLoyaltyDateInResponse() {
        LocalDateTime future = BrasiliaTime.now().plusDays(2);
        ObjectNode body = JSON.createObjectNode();
        body.put("club_id", 1);
        body.put("loyalty_until", future.format(DateTimeFormatter.ofPattern("uuuu-MM-dd'T'HH:mm")) + "-03:00");
        when(jogadores.findByIdAndExcluidoEmIsNull(1)).thenReturn(Optional.of(player(1, null, "36.00")));
        when(clubes.findById(1)).thenReturn(Optional.of(club(1, "300.00")));
        when(transacoes.save(any(Transacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PurchaseResponse response = service.purchase("1", body);

        assertThat(response.contract().loyaltyUntil())
                .startsWith(future.format(DateTimeFormatter.ofPattern("uuuu-MM-dd'T'HH:mm")));
    }

    private Contrato contract(int jogadorId, String purchaseValue, long loyaltyDays) {
        return new Contrato(jogadorId, 1, new BigDecimal(purchaseValue), BrasiliaTime.now().plusDays(loyaltyDays),
                ContractStatus.ATIVO, BrasiliaTime.now());
    }

    @Test
    @DisplayName("vende com multa de fidelidade e comissão sobre o lucro")
    void sellsPlayerWithPenaltyAndCommission() {
        Jogador jogador = player(1, 1, "40.00");
        Contrato contrato = contract(1, "37.00", 100);
        when(jogadores.findByIdAndExcluidoEmIsNull(1)).thenReturn(Optional.of(jogador));
        when(clubes.findById(1)).thenReturn(Optional.of(club(1, "300.00")));
        when(contratos.findByJogadorIdAndStatus(1, ContractStatus.ATIVO)).thenReturn(Optional.of(contrato));
        when(transacoes.save(any(Transacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SaleResponse response = service.sale("1");

        assertThat(response.playerName()).isEqualTo("Meia Lua");
        assertThat(response.type()).isEqualTo(TransactionType.VENDA);
        assertThat(response.purchaseValue()).isEqualByComparingTo("37.00");
        assertThat(response.value()).isEqualByComparingTo("40.00");
        assertThat(response.remainingDays()).isEqualTo(100);
        assertThat(response.penaltyRate()).isEqualTo(10);
        assertThat(response.penalty()).isEqualByComparingTo("4.00");
        assertThat(response.profit()).isEqualByComparingTo("3.00");
        assertThat(response.fee()).isEqualByComparingTo("0.30");
        assertThat(response.cashChange()).isEqualByComparingTo("35.70");
        assertThat(response.contractStatus()).isEqualTo(ContractStatus.RESCINDIDO);
        assertThat(response.clubCash()).isEqualByComparingTo("335.70");
        assertThat(jogador.clubeId()).isNull();
        assertThat(contrato.status()).isEqualTo(ContractStatus.RESCINDIDO);
        verify(escalacoes).deleteByJogadorId(1);

        ArgumentCaptor<Transacao> transaction = ArgumentCaptor.forClass(Transacao.class);
        verify(transacoes).save(transaction.capture());
        assertThat(transaction.getValue().tipo()).isEqualTo(TransactionType.VENDA);
        assertThat(transaction.getValue().jogadorNome()).isEqualTo("Meia Lua");
        assertThat(transaction.getValue().valor()).isEqualByComparingTo("40.00");
        assertThat(transaction.getValue().taxa()).isEqualByComparingTo("0.30");
        assertThat(transaction.getValue().multa()).isEqualByComparingTo("4.00");
        assertThat(transaction.getValue().lucro()).isEqualByComparingTo("3.00");
        assertThat(transaction.getValue().variacaoCaixa()).isEqualByComparingTo("35.70");
    }

    @Test
    @DisplayName("sem multa a fidelidade é cumprida e o contrato é encerrado")
    void encursesContractWhenLoyaltyIsFulfilled() {
        Jogador jogador = player(1, 1, "25.00");
        Contrato contrato = contract(1, "25.00", -5);
        when(jogadores.findByIdAndExcluidoEmIsNull(1)).thenReturn(Optional.of(jogador));
        when(clubes.findById(1)).thenReturn(Optional.of(club(1, "300.00")));
        when(contratos.findByJogadorIdAndStatus(1, ContractStatus.ATIVO)).thenReturn(Optional.of(contrato));
        when(transacoes.save(any(Transacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SaleResponse response = service.sale("1");

        assertThat(response.remainingDays()).isZero();
        assertThat(response.penalty()).isEqualByComparingTo("0.00");
        assertThat(response.profit()).isEqualByComparingTo("0.00");
        assertThat(response.fee()).isEqualByComparingTo("0.00");
        assertThat(response.cashChange()).isEqualByComparingTo("25.00");
        assertThat(contrato.status()).isEqualTo(ContractStatus.ENCERRADO);
    }

    @Test
    @DisplayName("limita a multa a 10,00 e não cobra comissão sem lucro")
    void capsPenaltyAndSkipsCommissionWithoutProfit() {
        Jogador expensive = player(1, 1, "75.00");
        Contrato cheapBuy = contract(1, "60.00", 200);
        when(jogadores.findByIdAndExcluidoEmIsNull(1)).thenReturn(Optional.of(expensive));
        when(clubes.findById(1)).thenReturn(Optional.of(club(1, "300.00")));
        when(contratos.findByJogadorIdAndStatus(1, ContractStatus.ATIVO)).thenReturn(Optional.of(cheapBuy));
        when(transacoes.save(any(Transacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SaleResponse capped = service.sale("1");

        assertThat(capped.penalty()).isEqualByComparingTo("10.00");
        assertThat(capped.fee()).isEqualByComparingTo("2.00");
        assertThat(capped.cashChange()).isEqualByComparingTo("63.00");

        Jogador devalued = player(2, 1, "42.50");
        Contrato expensiveBuy = contract(2, "50.00", 200);
        when(jogadores.findByIdAndExcluidoEmIsNull(2)).thenReturn(Optional.of(devalued));
        when(contratos.findByJogadorIdAndStatus(2, ContractStatus.ATIVO)).thenReturn(Optional.of(expensiveBuy));

        SaleResponse loss = service.sale("2");

        assertThat(loss.penalty()).isEqualByComparingTo("8.50");
        assertThat(loss.profit()).isEqualByComparingTo("-7.50");
        assertThat(loss.fee()).isEqualByComparingTo("0.00");
        assertThat(loss.cashChange()).isEqualByComparingTo("34.00");
    }

    @Test
    @DisplayName("recusa venda de jogador livre e responde 404 para jogador inexistente")
    void rejectsSaleOfFreeAndUnknownPlayers() {
        when(jogadores.findByIdAndExcluidoEmIsNull(1)).thenReturn(Optional.of(player(1, null, "36.00")));

        ApiException free = assertThrows(ApiException.class, () -> service.sale("1"));
        assertThat(free.status()).isEqualTo(409);
        verify(transacoes, never()).save(any(Transacao.class));

        when(jogadores.findByIdAndExcluidoEmIsNull(9)).thenReturn(Optional.empty());
        assertThat(assertThrows(ApiException.class, () -> service.sale("9")).status()).isEqualTo(404);
    }
}
