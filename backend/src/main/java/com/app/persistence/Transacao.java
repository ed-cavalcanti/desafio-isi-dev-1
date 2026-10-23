package com.app.persistence;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.app.model.TransactionType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Transação de compra ou venda gravada com os valores e o nome do momento
 * (RN17), mapeada na tabela transacoes.
 */
@Entity
@Table(name = "transacoes")
public class Transacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "clube_id")
    private Integer clubeId;

    @Column(name = "jogador_id")
    private Integer jogadorId;

    @Column(name = "nome_jogador", length = 100)
    private String jogadorNome;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", length = 6)
    private TransactionType tipo;

    @Column(name = "valor", precision = 6, scale = 2)
    private BigDecimal valor;

    @Column(name = "taxa", precision = 6, scale = 2)
    private BigDecimal taxa;

    @Column(name = "multa", precision = 6, scale = 2)
    private BigDecimal multa;

    @Column(name = "lucro", precision = 7, scale = 2)
    private BigDecimal lucro;

    @Column(name = "variacao_caixa", precision = 8, scale = 2)
    private BigDecimal variacaoCaixa;

    @Column(name = "criado_em")
    private LocalDateTime criadoEm;

    public Transacao() {
    }

    public Transacao(Integer clubeId, Integer jogadorId, String jogadorNome, TransactionType tipo, BigDecimal valor,
            BigDecimal taxa, BigDecimal multa, BigDecimal lucro, BigDecimal variacaoCaixa, LocalDateTime criadoEm) {
        this.clubeId = clubeId;
        this.jogadorId = jogadorId;
        this.jogadorNome = jogadorNome;
        this.tipo = tipo;
        this.valor = valor;
        this.taxa = taxa;
        this.multa = multa;
        this.lucro = lucro;
        this.variacaoCaixa = variacaoCaixa;
        this.criadoEm = criadoEm;
    }

    public Integer id() {
        return id;
    }

    public Integer clubeId() {
        return clubeId;
    }

    public Integer jogadorId() {
        return jogadorId;
    }

    public String jogadorNome() {
        return jogadorNome;
    }

    public TransactionType tipo() {
        return tipo;
    }

    public BigDecimal valor() {
        return valor;
    }

    public BigDecimal taxa() {
        return taxa;
    }

    public BigDecimal multa() {
        return multa;
    }

    public BigDecimal lucro() {
        return lucro;
    }

    public BigDecimal variacaoCaixa() {
        return variacaoCaixa;
    }

    public LocalDateTime criadoEm() {
        return criadoEm;
    }
}
