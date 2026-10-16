package com.app.model;

import java.math.BigDecimal;

/**
 * Condição física do jogador e o desconto que cada uma aplica ao valor de mercado.
 */
public enum Condition {
    APTO(BigDecimal.ZERO),
    MAL_CONDICIONADO(new BigDecimal("15")),
    DOENTE(new BigDecimal("30"));

    private final BigDecimal discountPercent;

    Condition(BigDecimal discountPercent) {
        this.discountPercent = discountPercent;
    }

    public BigDecimal discountPercent() {
        return discountPercent;
    }
}
