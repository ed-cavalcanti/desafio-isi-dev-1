package com.app.persistence;

import java.io.Serializable;
import java.util.Objects;

/**
 * Chave composta da tabela escalacoes: clube_id e jogador_id.
 */
public class EscalacaoId implements Serializable {

    private Integer clubeId;
    private Integer jogadorId;

    public EscalacaoId() {
    }

    public EscalacaoId(Integer clubeId, Integer jogadorId) {
        this.clubeId = clubeId;
        this.jogadorId = jogadorId;
    }

    public Integer getClubeId() {
        return clubeId;
    }

    public Integer getJogadorId() {
        return jogadorId;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof EscalacaoId that)) {
            return false;
        }
        return Objects.equals(clubeId, that.clubeId) && Objects.equals(jogadorId, that.jogadorId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(clubeId, jogadorId);
    }
}
