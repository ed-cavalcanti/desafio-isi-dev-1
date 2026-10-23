package com.app.api;

import com.app.model.Position;

/**
 * Campos editáveis do jogador no PUT /players/{id}, já validados (RN08).
 */
public record PlayerUpdateRequest(String name, Position position, Integer agility, Integer age) {
}
