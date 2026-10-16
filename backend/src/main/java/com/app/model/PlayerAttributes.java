package com.app.model;

/**
 * Os sete indicadores técnicos informados no cadastro do jogador.
 */
public record PlayerAttributes(int pace, int shooting, int passing, int dribbling, int defending,
        int physical, int potential) {
}
