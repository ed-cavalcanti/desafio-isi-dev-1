package com.app.persistence;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.app.model.ContractStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Contrato de fidelidade criado na compra (RN12), mapeado na tabela contratos.
 */
@Entity
@Table(name = "contratos")
public class Contrato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "jogador_id")
    private Integer jogadorId;

    @Column(name = "clube_id")
    private Integer clubeId;

    @Column(name = "valor_compra", precision = 6, scale = 2)
    private BigDecimal valorCompra;

    @Column(name = "fidelidade_ate")
    private LocalDateTime fidelidadeAte;

    @Enumerated(EnumType.STRING)
    @Column(name = "situacao", length = 12)
    private ContractStatus status;

    @Column(name = "iniciado_em")
    private LocalDateTime iniciadoEm;

    @Column(name = "encerrado_em")
    private LocalDateTime encerradoEm;

    public Contrato() {
    }

    public Contrato(Integer jogadorId, Integer clubeId, BigDecimal valorCompra, LocalDateTime fidelidadeAte,
            ContractStatus status, LocalDateTime iniciadoEm) {
        this.jogadorId = jogadorId;
        this.clubeId = clubeId;
        this.valorCompra = valorCompra;
        this.fidelidadeAte = fidelidadeAte;
        this.status = status;
        this.iniciadoEm = iniciadoEm;
    }

    public Integer id() {
        return id;
    }

    public Integer jogadorId() {
        return jogadorId;
    }

    public Integer clubeId() {
        return clubeId;
    }

    public BigDecimal valorCompra() {
        return valorCompra;
    }

    public LocalDateTime fidelidadeAte() {
        return fidelidadeAte;
    }

    public ContractStatus status() {
        return status;
    }

    /**
     * RN15.4 e RN16: encerra o contrato na venda, com o momento do encerramento.
     */
    public void encerrar(ContractStatus status, LocalDateTime momento) {
        this.status = status;
        this.encerradoEm = momento;
    }

    public LocalDateTime iniciadoEm() {
        return iniciadoEm;
    }

    public LocalDateTime encerradoEm() {
        return encerradoEm;
    }
}
