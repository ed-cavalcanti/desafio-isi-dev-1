package com.app.persistence;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Escalação do clube, mapeada na tabela escalacoes: a formação e os titulares
 * guardados em escalacao_titulares (RN19).
 */
@Entity
@Table(name = "escalacoes")
public class Escalacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "clube_id")
    private Integer clubeId;

    @Column(name = "formacao", length = 5)
    private String formacao;

    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    public Integer id() {
        return id;
    }

    public Integer clubeId() {
        return clubeId;
    }

    public void clubeId(Integer clubeId) {
        this.clubeId = clubeId;
    }

    public String formacao() {
        return formacao;
    }

    public void formacao(String formacao) {
        this.formacao = formacao;
    }

    public void atualizadoEm(LocalDateTime atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }
}
