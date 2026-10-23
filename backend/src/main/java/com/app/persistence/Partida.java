package com.app.persistence;

import java.time.LocalDateTime;

import com.app.model.MatchOutcome;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Partida jogada e gravada com o placar do momento (RN20), mapeada na tabela
 * partidas.
 */
@Entity
@Table(name = "partidas")
public class Partida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "mandante_id")
    private Integer mandanteClubeId;

    @Column(name = "visitante_id")
    private Integer visitanteClubeId;

    @Column(name = "gols_mandante")
    private Integer golsMandante;

    @Column(name = "gols_visitante")
    private Integer golsVisitante;

    @Enumerated(EnumType.STRING)
    @Column(name = "resultado", length = 9)
    private MatchOutcome resultado;

    @Column(name = "formacao_mandante", length = 5)
    private String formacaoMandante;

    @Column(name = "formacao_visitante", length = 5)
    private String formacaoVisitante;

    @Column(name = "jogada_em")
    private LocalDateTime jogadoEm;

    public Partida() {
    }

    public Partida(Integer mandanteClubeId, Integer visitanteClubeId, Integer golsMandante, Integer golsVisitante,
            MatchOutcome resultado, String formacaoMandante, String formacaoVisitante, LocalDateTime jogadoEm) {
        this.mandanteClubeId = mandanteClubeId;
        this.visitanteClubeId = visitanteClubeId;
        this.golsMandante = golsMandante;
        this.golsVisitante = golsVisitante;
        this.resultado = resultado;
        this.formacaoMandante = formacaoMandante;
        this.formacaoVisitante = formacaoVisitante;
        this.jogadoEm = jogadoEm;
    }

    public Integer id() {
        return id;
    }

    public Integer mandanteClubeId() {
        return mandanteClubeId;
    }

    public Integer visitanteClubeId() {
        return visitanteClubeId;
    }

    public Integer golsMandante() {
        return golsMandante;
    }

    public Integer golsVisitante() {
        return golsVisitante;
    }

    public MatchOutcome resultado() {
        return resultado;
    }

    public String formacaoMandante() {
        return formacaoMandante;
    }

    public String formacaoVisitante() {
        return formacaoVisitante;
    }

    public LocalDateTime jogadoEm() {
        return jogadoEm;
    }
}
