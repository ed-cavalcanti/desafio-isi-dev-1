package com.app.api;

import java.util.List;

import com.app.model.Formation;

/**
 * Escalação enviada em PUT /clubs/{id}/lineup, já validada (RN19).
 */
public record LineupRequest(Formation formation, List<Integer> playerIds) {
}
