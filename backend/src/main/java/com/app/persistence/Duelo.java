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
 * valores usados no momento da partida (RN20.7), mapeado na tabela
 * duelos_partida.
 */
@Entity
@Table(name = "duelos_partida")
public class Duelo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "partida_id")
    private Integer partidaId;

    @Column(name = "clube_atacante_id")
    private Integer clubeAtacanteId;

    @Column(name = "ordem")
    private Integer ordem;

    @Column(name = "atacante_id")
    private Integer atacanteJogadorId;

    @Column(name = "nome_atacante", length = 100)
    private String atacanteNome;

    @Enumerated(EnumType.STRING)
    @Column(name = "posicao_atacante", length = 3)
    private Position atacantePosicao;

    @Enumerated(EnumType.STRING)
    @Column(name = "condicao_atacante", length = 20)
    private Condition atacanteCondicao;

    @Column(name = "atributo_ataque", length = 10)
    private String atacanteAtributo;

    @Column(name = "valor_ataque")
    private Integer atacanteValor;

    @Column(name = "defensor_id")
    private Integer defensorJogadorId;

    @Column(name = "nome_defensor", length = 100)
    private String defensorNome;

    @Enumerated(EnumType.STRING)
    @Column(name = "posicao_defensor", length = 3)
    private Position defensorPosicao;

    @Enumerated(EnumType.STRING)
    @Column(name = "condicao_defensor", length = 20)
    private Condition defensorCondicao;

    @Column(name = "atributo_defesa", length = 10)
    private String defensorAtributo;

    @Column(name = "valor_defesa")
    private Integer defensorValor;

    @Column(name = "gol")
    private Boolean gol;

    public Duelo() {
    }

    public Duelo(Integer partidaId, Integer clubeAtacanteId, Integer ordem, Integer atacanteJogadorId,
            String atacanteNome, Position atacantePosicao, Condition atacanteCondicao, String atacanteAtributo,
            Integer atacanteValor, Integer defensorJogadorId, String defensorNome, Position defensorPosicao,
            Condition defensorCondicao, String defensorAtributo, Integer defensorValor, Boolean gol) {
        this.partidaId = partidaId;
        this.clubeAtacanteId = clubeAtacanteId;
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

    public Integer clubeAtacanteId() {
        return clubeAtacanteId;
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
