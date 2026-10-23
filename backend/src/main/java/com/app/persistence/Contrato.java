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

    @Column(name = "valor_compra", precision = 8, scale = 2)
    private BigDecimal valorCompra;

    @Column(name = "fidelidade_ate")
    private LocalDateTime fidelidadeAte;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 12)
    private ContractStatus status;

    @Column(name = "criado_em")
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    public Contrato() {
    }

    public Contrato(Integer jogadorId, Integer clubeId, BigDecimal valorCompra, LocalDateTime fidelidadeAte,
            ContractStatus status, LocalDateTime criadoEm) {
        this.jogadorId = jogadorId;
        this.clubeId = clubeId;
        this.valorCompra = valorCompra;
        this.fidelidadeAte = fidelidadeAte;
        this.status = status;
        this.criadoEm = criadoEm;
        this.atualizadoEm = criadoEm;
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

    public void status(ContractStatus status) {
        this.status = status;
    }

    public void atualizadoEm(LocalDateTime atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }
}
