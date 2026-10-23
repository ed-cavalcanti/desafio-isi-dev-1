package com.app.api;

import java.time.LocalDateTime;

/**
 * Compra enviada em POST /players/{id}/purchase, já validada (RN12).
 */
public record PurchaseRequest(Integer clubId, LocalDateTime loyaltyUntil) {
}
