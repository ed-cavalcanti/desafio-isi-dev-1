package com.app.persistence;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * Titular da escalação do clube, mapeado na tabela escalacoes com a chave
 * composta (clube_id, jogador_id) e um jogador em no máximo uma escalação
 * (RN19).
 */
@Entity
@Table(name = "escalacoes", uniqueConstraints = @UniqueConstraint(columnNames = "jogador_id"))
@IdClass(EscalacaoId.class)
public class Escalacao {

    @Id
    @Column(name = "clube_id")
    private Integer clubeId;

    @Id
    @Column(name = "jogador_id")
    private Integer jogadorId;

    @Column(name = "criado_em")
    private LocalDateTime criadoEm;

    public Escalacao() {
    }

    public Escalacao(Integer clubeId, Integer jogadorId, LocalDateTime criadoEm) {
        this.clubeId = clubeId;
        this.jogadorId = jogadorId;
        this.criadoEm = criadoEm;
    }

    public Integer clubeId() {
        return clubeId;
    }

    public Integer jogadorId() {
        return jogadorId;
    }

    public LocalDateTime criadoEm() {
        return criadoEm;
    }
}
