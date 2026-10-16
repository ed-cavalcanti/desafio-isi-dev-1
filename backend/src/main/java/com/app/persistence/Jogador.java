package com.app.persistence;

import com.app.model.Condition;
import com.app.model.PlayerAttributes;
import com.app.model.Position;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Jogador da liga, mapeado na tabela jogadores.
 */
@Entity
@Table(name = "jogadores")
public class Jogador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "nome", length = 100)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(name = "posicao", length = 3)
    private Position posicao;

    @Column(name = "agilidade")
    private Integer agilidade;

    @Column(name = "idade")
    private Integer idade;

    @Column(name = "valor_base", precision = 6, scale = 2)
    private BigDecimal valorBase;

    @Enumerated(EnumType.STRING)
    @Column(name = "condicao", length = 20)
    private Condition condicao;

    @Column(name = "clube_id")
    private Integer clubeId;

    @Column(name = "velocidade")
    private Integer velocidade;

    @Column(name = "finalizacao")
    private Integer finalizacao;

    @Column(name = "passe")
    private Integer passe;

    @Column(name = "drible")
    private Integer drible;

    @Column(name = "defesa")
    private Integer defesa;

    @Column(name = "fisico")
    private Integer fisico;

    @Column(name = "potencial")
    private Integer potencial;

    @Column(name = "excluido_em")
    private LocalDateTime excluidoEm;

    @Column(name = "criado_em")
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    public Integer id() {
        return id;
    }

    public PlayerAttributes attributes() {
        return new PlayerAttributes(velocidade, finalizacao, passe, drible, defesa, fisico, potencial);
    }

    public Position posicao() {
        return posicao;
    }

    public void posicao(Position posicao) {
        this.posicao = posicao;
    }

    public Integer agilidade() {
        return agilidade;
    }

    public void agilidade(Integer agilidade) {
        this.agilidade = agilidade;
    }

    public Integer idade() {
        return idade;
    }

    public void idade(Integer idade) {
        this.idade = idade;
    }

    public BigDecimal valorBase() {
        return valorBase;
    }

    public void valorBase(BigDecimal valorBase) {
        this.valorBase = valorBase;
    }

    public Condition condicao() {
        return condicao;
    }

    public void condicao(Condition condicao) {
        this.condicao = condicao;
    }

    public Integer clubeId() {
        return clubeId;
    }

    public void clubeId(Integer clubeId) {
        this.clubeId = clubeId;
    }

    public String nome() {
        return nome;
    }

    public void nome(String nome) {
        this.nome = nome;
    }

    public void velocidade(Integer velocidade) {
        this.velocidade = velocidade;
    }

    public void finalizacao(Integer finalizacao) {
        this.finalizacao = finalizacao;
    }

    public void passe(Integer passe) {
        this.passe = passe;
    }

    public void drible(Integer drible) {
        this.drible = drible;
    }

    public void defesa(Integer defesa) {
        this.defesa = defesa;
    }

    public void fisico(Integer fisico) {
        this.fisico = fisico;
    }

    public void potencial(Integer potencial) {
        this.potencial = potencial;
    }

    public void criadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }

    public void atualizadoEm(LocalDateTime atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }
}
