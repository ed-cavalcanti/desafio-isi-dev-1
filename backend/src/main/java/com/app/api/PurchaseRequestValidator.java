package com.app.api;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;

import org.springframework.stereotype.Component;

import com.app.model.BrasiliaTime;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * Validação do corpo de POST /players/{id}/buy: o clube comprador e o fim
 * da fidelidade no formato da RN01 (RN12).
 */
@Component
public class PurchaseRequestValidator {

    private static final int LOYALTY_MAX_DAYS = 1095;

    public PurchaseRequest purchase(JsonNode body) {
        if (body == null || !body.isObject()) {
            throw ApiException.badRequest("Corpo da requisição deve ser um objeto JSON.");
        }
        Integer clubId = clubId(body);
        LocalDateTime loyaltyUntil = loyaltyUntil(body);
        return new PurchaseRequest(clubId, loyaltyUntil);
    }

    private Integer clubId(JsonNode body) {
        JsonNode node = body.get("club_id");
        if (node == null || node.isNull()) {
            throw ApiException.badRequest("O campo club_id é obrigatório.");
        }
        if (!node.isNumber()) {
            throw ApiException.badRequest("O campo club_id deve ser um número inteiro.");
        }
        BigDecimal value = node.decimalValue();
        if (value.stripTrailingZeros().scale() > 0) {
            throw ApiException.badRequest("O campo club_id deve ser um número inteiro.");
        }
        try {
            int clubId = value.intValueExact();
            if (clubId < 1) {
                throw ApiException.badRequest("O campo club_id deve ser um inteiro positivo.");
            }
            return clubId;
        } catch (ArithmeticException exception) {
            throw ApiException.badRequest("O campo club_id está fora do intervalo permitido.");
        }
    }

    private LocalDateTime loyaltyUntil(JsonNode body) {
        JsonNode node = body.get("loyalty_until");
        if (node == null || node.isNull() || !node.isTextual()) {
            throw ApiException.badRequest("O campo loyalty_until é obrigatório e deve ser um texto.");
        }
        LocalDateTime loyaltyUntil;
        try {
            loyaltyUntil = BrasiliaTime.parse(node.asText());
        } catch (DateTimeParseException exception) {
            throw ApiException.badRequest(
                    "O campo loyalty_until deve estar no formato AAAA-MM-DDTHH:MM-03:00 e ser uma data e hora existentes.");
        }
        LocalDateTime now = BrasiliaTime.now();
        if (!loyaltyUntil.isAfter(now) || loyaltyUntil.isAfter(now.plusDays(LOYALTY_MAX_DAYS))) {
            throw ApiException.badRequest(
                    "O campo loyalty_until deve ser depois do momento da compra e até 1.095 dias depois dele.");
        }
        return loyaltyUntil;
    }
}
