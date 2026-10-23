package com.app.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.api.ApiException;
import com.app.api.ContractCreatedResponse;
import com.app.api.PathId;
import com.app.api.PurchaseRequest;
import com.app.api.PurchaseRequestValidator;
import com.app.api.PurchaseResponse;
import com.app.api.SaleResponse;
import com.app.mapper.PlayerMapper;
import com.app.model.BrasiliaTime;
import com.app.model.ContractStatus;
import com.app.model.MarketCalculator;
import com.app.model.TransactionType;
import com.app.persistence.Clube;
import com.app.persistence.ClubeRepository;
import com.app.persistence.Contrato;
import com.app.persistence.ContratoRepository;
import com.app.persistence.Jogador;
import com.app.persistence.JogadorRepository;
import com.app.persistence.Transacao;
import com.app.persistence.TransacaoRepository;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * Compra e venda de jogadores (RN12 a RN16): contrato de fidelidade, taxa de
 * compra, limite de 50% do caixa, multa e comissão de venda, sempre com a
 * transação gravada na mesma operação.
 */
@Service
public class MarketService {

    private static final int MAX_SQUAD = 12;
    private static final BigDecimal TWO = new BigDecimal(2);

    private final PurchaseRequestValidator validator;
    private final PlayerMapper playerMapper;
    private final ClubeRepository clubes;
    private final JogadorRepository jogadores;
    private final ContratoRepository contratos;
    private final TransacaoRepository transacoes;
    private final LineupService lineups;

    public MarketService(PurchaseRequestValidator validator, PlayerMapper playerMapper, ClubeRepository clubes,
            JogadorRepository jogadores, ContratoRepository contratos, TransacaoRepository transacoes,
            LineupService lineups) {
        this.validator = validator;
        this.playerMapper = playerMapper;
        this.clubes = clubes;
        this.jogadores = jogadores;
        this.contratos = contratos;
        this.transacoes = transacoes;
        this.lineups = lineups;
    }

    @Transactional
    public PurchaseResponse purchase(String rawId, JsonNode body) {
        int playerId = PathId.parse(rawId);
        PurchaseRequest request = validator.purchase(body);
        Jogador jogador = findPlayer(playerId);
        Clube clube = clubes.findById(request.clubId())
                .orElseThrow(() -> ApiException.notFound("Clube não encontrado."));
        if (jogador.clubeId() != null) {
            throw ApiException.conflict("O jogador precisa estar livre para ser comprado.");
        }
        if (transacoes.existsByClubeIdAndJogadorIdAndTipo(clube.id(), jogador.id(), TransactionType.VENDA)) {
            throw ApiException.conflict("O clube não pode comprar um jogador que ele mesmo já vendeu.");
        }
        if (jogadores.countByClubeId(clube.id()) >= MAX_SQUAD) {
            throw ApiException.conflict("O clube já tem 12 jogadores no elenco.");
        }
        BigDecimal marketValue = playerMapper.toResponse(jogador).marketValue();
        BigDecimal fee = MarketCalculator.purchaseFee(marketValue);
        BigDecimal totalCost = marketValue.add(fee);
        if (totalCost.multiply(TWO).compareTo(clube.caixa()) > 0) {
            throw ApiException.conflict("O custo da compra (" + totalCost
                    + ") passa do limite de 50% do caixa (" + clube.caixa().divide(TWO) + ").");
        }
        LocalDateTime now = BrasiliaTime.now();
        clube.caixa(clube.caixa().subtract(totalCost));
        clubes.save(clube);
        jogador.clubeId(clube.id());
        jogadores.save(jogador);
        contratos.save(new Contrato(jogador.id(), clube.id(), marketValue, request.loyaltyUntil(),
                ContractStatus.ATIVO, now));
        Transacao transaction = transacoes.save(new Transacao(clube.id(), jogador.id(), jogador.nome(),
                TransactionType.COMPRA, marketValue, fee, BigDecimal.ZERO.setScale(2), null, totalCost.negate(), now));
        ContractCreatedResponse contract = new ContractCreatedResponse(marketValue,
                BrasiliaTime.format(request.loyaltyUntil()), ContractStatus.ATIVO);
        return new PurchaseResponse(transaction.id(), clube.id(), jogador.id(), jogador.nome(),
                TransactionType.COMPRA, marketValue, fee, BigDecimal.ZERO.setScale(2), null, totalCost.negate(),
                BrasiliaTime.format(now), contract, clube.caixa(), totalCost);
    }

    /**
     * RN15 e RN16: vende o jogador do clube atual pelo valor de mercado do
     * momento, com multa pela fidelidade restante e comissão progressiva sobre
     * o lucro; o titular sai da escalação (RN19.5).
     */
    @Transactional
    public SaleResponse sale(String rawId) {
        int playerId = PathId.parse(rawId);
        Jogador jogador = findPlayer(playerId);
        if (jogador.clubeId() == null) {
            throw ApiException.conflict("Jogador livre não pode ser vendido.");
        }
        Clube clube = clubes.findById(jogador.clubeId()).orElseThrow();
        Contrato contrato = contratos.findByJogadorIdAndStatus(jogador.id(), ContractStatus.ATIVO).orElseThrow();
        LocalDateTime now = BrasiliaTime.now();
        BigDecimal marketValue = playerMapper.toResponse(jogador).marketValue();
        int daysRemaining = MarketCalculator.daysRemaining(contrato.fidelidadeAte(), now);
        int penaltyPercent = MarketCalculator.penaltyPercent(daysRemaining);
        BigDecimal penalty = MarketCalculator.penalty(marketValue, penaltyPercent);
        BigDecimal profit = marketValue.subtract(contrato.valorCompra());
        BigDecimal commission = MarketCalculator.commission(profit);
        BigDecimal credit = marketValue.subtract(penalty).subtract(commission);
        contrato.encerrar(penalty.signum() == 0 ? ContractStatus.ENCERRADO : ContractStatus.RESCINDIDO, now);
        contratos.save(contrato);
        clube.caixa(clube.caixa().add(credit));
        clubes.save(clube);
        jogador.clubeId(null);
        jogadores.save(jogador);
        lineups.removeTitular(jogador.id());
        Transacao transaction = transacoes.save(new Transacao(clube.id(), jogador.id(), jogador.nome(),
                TransactionType.VENDA, marketValue, commission, penalty, profit, credit, now));
        return new SaleResponse(transaction.id(), clube.id(), jogador.id(), jogador.nome(), TransactionType.VENDA,
                marketValue, commission, penalty, profit, credit, BrasiliaTime.format(now), contrato.valorCompra(),
                daysRemaining, penaltyPercent, contrato.status(), clube.caixa());
    }

    private Jogador findPlayer(int playerId) {
        return jogadores.findByIdAndExcluidoEmIsNull(playerId)
                .orElseThrow(() -> ApiException.notFound("Jogador não encontrado."));
    }
}
