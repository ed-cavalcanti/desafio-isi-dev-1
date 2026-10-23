package com.app.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Titular da escalação, mapeado na tabela escalacao_titulares (RN19).
 */
@Entity
@Table(name = "escalacao_titulares")
public class EscalacaoTitular {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "escalacao_id")
    private Integer escalacaoId;

    @Column(name = "jogador_id")
    private Integer jogadorId;

    public EscalacaoTitular() {
    }

    public EscalacaoTitular(Integer escalacaoId, Integer jogadorId) {
        this.escalacaoId = escalacaoId;
        this.jogadorId = jogadorId;
    }

    public Integer escalacaoId() {
        return escalacaoId;
    }

    public Integer jogadorId() {
        return jogadorId;
    }
}
