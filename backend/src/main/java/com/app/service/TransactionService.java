package com.app.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.api.ApiException;
import com.app.api.PathId;
import com.app.api.TransactionQuery;
import com.app.api.TransactionResponse;
import com.app.api.TransactionSummary;
import com.app.api.TransactionsResponse;
import com.app.model.BrasiliaTime;
import com.app.model.TransactionType;
import com.app.persistence.Clube;
import com.app.persistence.ClubeRepository;
import com.app.persistence.JogadorRepository;
import com.app.persistence.Transacao;
import com.app.persistence.TransacaoRepository;

/**
 * Histórico de transações do clube e exportação em CSV (RN17 e RN18): os
 * valores e o nome vêm do momento da operação e nunca são recalculados.
 */
@Service
public class TransactionService {

    private static final String CSV_HEADER = "data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa\n";
    private static final BigDecimal ZERO = BigDecimal.ZERO.setScale(2);

    private final ClubeRepository clubes;
    private final JogadorRepository jogadores;
    private final TransacaoRepository transacoes;

    public TransactionService(ClubeRepository clubes, JogadorRepository jogadores, TransacaoRepository transacoes) {
        this.clubes = clubes;
        this.jogadores = jogadores;
        this.transacoes = transacoes;
    }

    @Transactional(readOnly = true)
    public TransactionsResponse list(String rawId, TransactionQuery query) {
        List<Transacao> transactions = transactions(findClub(rawId), query);
        return new TransactionsResponse(transactions.stream().map(this::toResponse).toList(), summary(transactions));
    }

    @Transactional(readOnly = true)
    public String export(String rawId, TransactionQuery query) {
        return csv(transactions(findClub(rawId), query));
    }

    private Clube findClub(String rawId) {
        int id = PathId.parse(rawId);
        return clubes.findById(id)
                .orElseThrow(() -> ApiException.notFound("Clube não encontrado."));
    }

    private List<Transacao> transactions(Clube clube, TransactionQuery query) {
        if (query.playerId() != null && jogadores.findByIdAndExcluidoEmIsNull(query.playerId()).isEmpty()) {
            throw ApiException.notFound("Jogador não encontrado.");
        }
        return transacoes.findByClubeId(clube.id()).stream()
                .filter(transaction -> matches(transaction, query))
                .sorted(Comparator.comparing(Transacao::criadoEm).thenComparing(Transacao::id).reversed())
                .toList();
    }

    private boolean matches(Transacao transaction, TransactionQuery query) {
        if (query.types() != null && !query.types().contains(transaction.tipo())) {
            return false;
        }
        return query.playerId() == null || query.playerId().equals(transaction.jogadorId());
    }

    private TransactionSummary summary(List<Transacao> transactions) {
        BigDecimal totalSpent = ZERO;
        BigDecimal totalReceived = ZERO;
        BigDecimal totalFees = ZERO;
        BigDecimal totalPenalties = ZERO;
        BigDecimal totalProfit = ZERO;
        for (Transacao transaction : transactions) {
            if (transaction.tipo() == TransactionType.COMPRA) {
                totalSpent = totalSpent.add(transaction.valor()).add(transaction.taxa());
            } else {
                totalReceived = totalReceived.add(transaction.variacaoCaixa());
                totalPenalties = totalPenalties.add(transaction.multa());
                totalProfit = totalProfit.add(transaction.lucro());
            }
            totalFees = totalFees.add(transaction.taxa());
        }
        return new TransactionSummary(scale(totalSpent), scale(totalReceived), scale(totalFees),
                scale(totalPenalties), scale(totalProfit));
    }

    private BigDecimal scale(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private TransactionResponse toResponse(Transacao transaction) {
        return new TransactionResponse(transaction.id(), transaction.clubeId(), transaction.jogadorId(),
                transaction.jogadorNome(), transaction.tipo(), transaction.valor(), transaction.taxa(),
                transaction.multa(), transaction.lucro(), transaction.variacaoCaixa(),
                BrasiliaTime.format(transaction.criadoEm()));
    }

    private String csv(List<Transacao> transactions) {
        StringBuilder csv = new StringBuilder(CSV_HEADER);
        for (Transacao transaction : transactions) {
            csv.append(BrasiliaTime.format(transaction.criadoEm())).append(';')
                    .append(transaction.tipo().name()).append(';')
                    .append(quoted(transaction.jogadorNome())).append(';')
                    .append(money(transaction.valor())).append(';')
                    .append(money(transaction.taxa())).append(';')
                    .append(money(transaction.multa())).append(';')
                    .append(transaction.lucro() == null ? "" : money(transaction.lucro())).append(';')
                    .append(money(transaction.variacaoCaixa())).append('\n');
        }
        return csv.toString();
    }

    private String money(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP).toPlainString().replace('.', ',');
    }

    private String quoted(String name) {
        if (name.indexOf(';') < 0 && name.indexOf('"') < 0) {
            return name;
        }
        return '"' + name.replace("\"", "\"\"") + '"';
    }
}
