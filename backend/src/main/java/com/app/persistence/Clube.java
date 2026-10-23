package com.app.persistence;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Clube da liga, mapeado na tabela clubes. O nome de busca guarda o nome já
 * normalizado (V4) em minúsculas, para a unicidade do nome ignorar maiúsculas e
 * minúsculas sem ignorar acentos.
 */
@Entity
@Table(name = "clubes")
public class Clube {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "nome", length = 60)
    private String nome;

    @Column(name = "nome_busca", length = 60)
    private String nomeBusca;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "sigla", length = 3, columnDefinition = "CHAR(3)")
    private String sigla;

    @Column(name = "caixa", precision = 10, scale = 2)
    private BigDecimal caixa;

    @Column(name = "formacao", length = 5)
    private String formacao;

    @Column(name = "criado_em")
    private LocalDateTime criadoEm;

    public Integer id() {
        return id;
    }

    public String nome() {
        return nome;
    }

    public void nome(String nome) {
        this.nome = nome;
    }

    public String nomeBusca() {
        return nomeBusca;
    }

    public void nomeBusca(String nomeBusca) {
        this.nomeBusca = nomeBusca;
    }

    public String sigla() {
        return sigla;
    }

    public void sigla(String sigla) {
        this.sigla = sigla;
    }

    public BigDecimal caixa() {
        return caixa;
    }

    public void caixa(BigDecimal caixa) {
        this.caixa = caixa;
    }

    public String formacao() {
        return formacao;
    }

    public void formacao(String formacao) {
        this.formacao = formacao;
    }

    public void criadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }
}
