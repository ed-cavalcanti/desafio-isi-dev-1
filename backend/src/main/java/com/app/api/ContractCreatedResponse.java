package com.app.api;

import java.math.BigDecimal;

import com.app.model.ContractStatus;

/**
 * Contrato criado pela compra, no formato da resposta do enunciado (RN12).
 */
public record ContractCreatedResponse(BigDecimal purchaseValue, String loyaltyUntil, ContractStatus status) {
}
