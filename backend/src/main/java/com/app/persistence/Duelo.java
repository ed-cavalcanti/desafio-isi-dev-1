package com.app.persistence;

import com.app.model.Condition;
import com.app.model.Position;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Duelo gravado com os nomes, as posições, as condições, os atributos e os
 * valores usados no momento da partida (RN20.7), mapeado na tabela duelos.
 */
@Entity
@Table(name = "duelos")
public class Duelo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "partida_id")
    private Integer partidaId;

    @Column(name = "ordem")
    private Integer ordem;

    @Column(name = "atacante_jogador_id")
    private Integer atacanteJogadorId;

    @Column(name = "atacante_nome", length = 100)
    private String atacanteNome;

    @Enumerated(EnumType.STRING)
    @Column(name = "atacante_posicao", length = 3)
    private Position atacantePosicao;

    @Enumerated(EnumType.STRING)
    @Column(name = "atacante_condicao", length = 20)
    private Condition atacanteCondicao;

    @Column(name = "atacante_atributo", length = 11)
    private String atacanteAtributo;

    @Column(name = "atacante_valor")
    private Integer atacanteValor;

    @Column(name = "defensor_jogador_id")
    private Integer defensorJogadorId;

    @Column(name = "defensor_nome", length = 100)
    private String defensorNome;

    @Enumerated(EnumType.STRING)
    @Column(name = "defensor_posicao", length = 3)
    private Position defensorPosicao;

    @Enumerated(EnumType.STRING)
    @Column(name = "defensor_condicao", length = 20)
    private Condition defensorCondicao;

    @Column(name = "defensor_atributo", length = 11)
    private String defensorAtributo;

    @Column(name = "defensor_valor")
    private Integer defensorValor;

    @Column(name = "gol")
    private Boolean gol;

    public Duelo() {
    }

    public Duelo(Integer partidaId, Integer ordem, Integer atacanteJogadorId, String atacanteNome,
            Position atacantePosicao, Condition atacanteCondicao, String atacanteAtributo, Integer atacanteValor,
            Integer defensorJogadorId, String defensorNome, Position defensorPosicao, Condition defensorCondicao,
            String defensorAtributo, Integer defensorValor, Boolean gol) {
        this.partidaId = partidaId;
        this.ordem = ordem;
        this.atacanteJogadorId = atacanteJogadorId;
        this.atacanteNome = atacanteNome;
        this.atacantePosicao = atacantePosicao;
        this.atacanteCondicao = atacanteCondicao;
        this.atacanteAtributo = atacanteAtributo;
        this.atacanteValor = atacanteValor;
        this.defensorJogadorId = defensorJogadorId;
        this.defensorNome = defensorNome;
        this.defensorPosicao = defensorPosicao;
        this.defensorCondicao = defensorCondicao;
        this.defensorAtributo = defensorAtributo;
        this.defensorValor = defensorValor;
        this.gol = gol;
    }

    public Integer id() {
        return id;
    }

    public Integer partidaId() {
        return partidaId;
    }

    public Integer ordem() {
        return ordem;
    }

    public Integer atacanteJogadorId() {
        return atacanteJogadorId;
    }

    public String atacanteNome() {
        return atacanteNome;
    }

    public Position atacantePosicao() {
        return atacantePosicao;
    }

    public Condition atacanteCondicao() {
        return atacanteCondicao;
    }

    public String atacanteAtributo() {
        return atacanteAtributo;
    }

    public Integer atacanteValor() {
        return atacanteValor;
    }

    public Integer defensorJogadorId() {
        return defensorJogadorId;
    }

    public String defensorNome() {
        return defensorNome;
    }

    public Position defensorPosicao() {
        return defensorPosicao;
    }

    public Condition defensorCondicao() {
        return defensorCondicao;
    }

    public String defensorAtributo() {
        return defensorAtributo;
    }

    public Integer defensorValor() {
        return defensorValor;
    }

    public Boolean gol() {
        return gol;
    }
}
