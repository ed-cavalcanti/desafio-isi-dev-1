package com.app.api;

import com.app.model.PlayerAttributes;
import com.app.model.Position;

/**
 * Dados cadastrais validados do jogador (POST /players).
 */
public record PlayerRequest(String name, Position position, Integer agility, Integer age,
        PlayerAttributes attributes) {
}
