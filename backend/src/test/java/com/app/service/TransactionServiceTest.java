package com.app.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.app.api.ApiException;
import com.app.api.TransactionQuery;
import com.app.api.TransactionResponse;
import com.app.api.TransactionsResponse;
import com.app.model.Condition;
import com.app.model.Position;
import com.app.model.TransactionType;
import com.app.persistence.Clube;
import com.app.persistence.ClubeRepository;
import com.app.persistence.Jogador;
import com.app.persistence.JogadorRepository;
import com.app.persistence.Transacao;
import com.app.persistence.TransacaoRepository;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    private static final LocalDateTime PURCHASE_DATE = LocalDateTime.of(2026, 11, 2, 10, 15);
    private static final LocalDateTime SALE_DATE = LocalDateTime.of(2026, 11, 5, 16, 40);

    @Mock
    private ClubeRepository clubes;

    @Mock
    private JogadorRepository jogadores;

    @Mock
    private TransacaoRepository transacoes;

    private TransactionService service;

    @BeforeEach
    void setUp() {
        service = new TransactionService(clubes, jogadores, transacoes);
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

    private Transacao transaction(int id, int jogadorId, String name, TransactionType type, String value, String fee,
            String penalty, String profit, String cashChange, LocalDateTime createdAt) {
        Transacao transaction = new Transacao(1, jogadorId, name, type, new BigDecimal(value), new BigDecimal(fee),
                new BigDecimal(penalty), profit == null ? null : new BigDecimal(profit),
                new BigDecimal(cashChange), createdAt);
        ReflectionTestUtils.setField(transaction, "id", id);
        return transaction;
    }

    private Transacao purchase(int id) {
        return transaction(id, 5, "Meia Lua", TransactionType.COMPRA, "37.00", "1.85", "0.00", null, "-38.85",
                PURCHASE_DATE);
    }

    private Transacao sale(int id) {
        return transaction(id, 5, "Meia Lua", TransactionType.VENDA, "40.00", "0.30", "4.00", "3.00", "35.70",
                SALE_DATE);
    }

    private void stubClub() {
        when(clubes.findById(1)).thenReturn(Optional.of(club(1)));
    }

    private Jogador player(int id) {
        Jogador jogador = new Jogador();
        jogador.nome("Meia Lua");
        jogador.posicao(Position.MEI);
        jogador.agilidade(50);
        jogador.idade(25);
        jogador.valorBase(new BigDecimal("36.00"));
        jogador.condicao(Condition.APTO);
        jogador.clubeId(1);
        ReflectionTestUtils.setField(jogador, "id", id);
        return jogador;
    }

    @Test
    @DisplayName("lista da mais recente para a mais antiga com o resumo dos totais")
    void listsTransactionsWithSummary() {
        stubClub();
        when(transacoes.findByClubeId(1)).thenReturn(List.of(purchase(1), sale(2)));

        TransactionsResponse response = service.list("1", new TransactionQuery(null, null));

        assertThat(response.data()).extracting(TransactionResponse::id).containsExactly(2, 1);
        assertThat(response.data().get(0).playerName()).isEqualTo("Meia Lua");
        assertThat(response.data().get(0).createdAt()).isEqualTo("2026-11-05T16:40:00-03:00");
        assertThat(response.summary().totalSpent()).isEqualByComparingTo("38.85");
        assertThat(response.summary().totalReceived()).isEqualByComparingTo("35.70");
        assertThat(response.summary().totalFees()).isEqualByComparingTo("2.15");
        assertThat(response.summary().totalPenalties()).isEqualByComparingTo("4.00");
        assertThat(response.summary().totalProfit()).isEqualByComparingTo("3.00");
    }

    @Test
    @DisplayName("desempata a mesma data pelo id decrescente")
    void breaksDateTiesById() {
        stubClub();
        Transacao sameMoment = transaction(3, 5, "Meia Lua", TransactionType.VENDA, "40.00", "0.30", "4.00", "3.00",
                "35.70", PURCHASE_DATE);
        when(transacoes.findByClubeId(1)).thenReturn(List.of(purchase(1), sameMoment));

        TransactionsResponse response = service.list("1", new TransactionQuery(null, null));

        assertThat(response.data()).extracting(TransactionResponse::id).containsExactly(3, 1);
    }

    @Test
    @DisplayName("filtra por tipo e o resumo respeita o filtro")
    void filtersByType() {
        stubClub();
        when(transacoes.findByClubeId(1)).thenReturn(List.of(purchase(1), sale(2)));

        TransactionsResponse sales = service.list("1", new TransactionQuery(EnumSet.of(TransactionType.VENDA), null));

        assertThat(sales.data()).extracting(TransactionResponse::id).containsExactly(2);
        assertThat(sales.summary().totalSpent()).isEqualByComparingTo("0.00");
        assertThat(sales.summary().totalReceived()).isEqualByComparingTo("35.70");
        assertThat(sales.summary().totalProfit()).isEqualByComparingTo("3.00");
    }

    @Test
    @DisplayName("filtra por jogador existente e devolve vazio sem transações")
    void filtersByPlayerAndReturnsEmptyHistory() {
        stubClub();
        when(transacoes.findByClubeId(1)).thenReturn(List.of(purchase(1), sale(2)));
        when(jogadores.findByIdAndExcluidoEmIsNull(5)).thenReturn(Optional.of(player(5)));
        when(jogadores.findByIdAndExcluidoEmIsNull(6)).thenReturn(Optional.of(player(6)));
        Set<TransactionType> types = EnumSet.allOf(TransactionType.class);

        TransactionsResponse response = service.list("1", new TransactionQuery(types, 5));
        assertThat(response.data()).hasSize(2);

        TransactionsResponse empty = service.list("1", new TransactionQuery(types, 6));
        assertThat(empty.data()).isEmpty();
        assertThat(empty.summary().totalSpent()).isEqualByComparingTo("0.00");
        assertThat(empty.summary().totalReceived()).isEqualByComparingTo("0.00");
        assertThat(empty.summary().totalFees()).isEqualByComparingTo("0.00");
        assertThat(empty.summary().totalPenalties()).isEqualByComparingTo("0.00");
        assertThat(empty.summary().totalProfit()).isEqualByComparingTo("0.00");
    }

    @Test
    @DisplayName("responde 404 para clube inexistente e para jogador inexistente ou excluído")
    void returnsNotFound() {
        when(clubes.findById(99)).thenReturn(Optional.empty());
        assertThat(assertThrows(ApiException.class,
                () -> service.list("99", new TransactionQuery(null, null))).status()).isEqualTo(404);
        assertThat(assertThrows(ApiException.class,
                () -> service.export("abc", new TransactionQuery(null, null))).status()).isEqualTo(404);

        stubClub();
        when(jogadores.findByIdAndExcluidoEmIsNull(9)).thenReturn(Optional.empty());
        assertThat(assertThrows(ApiException.class,
                () -> service.list("1", new TransactionQuery(null, 9))).status()).isEqualTo(404);
    }

    @Test
    @DisplayName("exporta o histórico em CSV no formato da RN18")
    void exportsCsv() {
        stubClub();
        when(transacoes.findByClubeId(1)).thenReturn(List.of(purchase(1), sale(2)));

        String csv = service.export("1", new TransactionQuery(null, null));

        assertThat(csv).isEqualTo("""
                data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa
                2026-11-05T16:40:00-03:00;VENDA;Meia Lua;40,00;0,30;4,00;3,00;35,70
                2026-11-02T10:15:00-03:00;COMPRA;Meia Lua;37,00;1,85;0,00;;-38,85
                """);
    }

    @Test
    @DisplayName("sem transações o CSV tem só o cabeçalho e aspas no nome com ; ou aspas")
    void exportsEmptyCsvAndQuotesNames() {
        stubClub();
        when(transacoes.findByClubeId(1)).thenReturn(List.of());
        assertThat(service.export("1", new TransactionQuery(null, null))).isEqualTo(
                "data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa\n");

        Transacao tricky = transaction(3, 5, "Zé \"Foguete\" Lima;Zaga", TransactionType.VENDA, "40.00", "0.30",
                "0.00", "3.00", "39.70", SALE_DATE);
        when(transacoes.findByClubeId(1)).thenReturn(List.of(tricky));

        assertThat(service.export("1", new TransactionQuery(null, null)))
                .contains(";\"Zé \"\"Foguete\"\" Lima;Zaga\";");
    }
}
