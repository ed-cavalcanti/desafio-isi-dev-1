package com.app.api;

import java.util.List;

/**
 * Escalação do clube nas respostas da API (RN19): a formação salva, a
 * completude e os titulares na ordem do elenco.
 */
public record LineupResponse(Integer clubId, String formation, boolean complete, List<PlayerResponse> players) {
}
