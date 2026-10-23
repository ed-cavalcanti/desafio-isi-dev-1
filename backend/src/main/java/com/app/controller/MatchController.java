package com.app.controller;

import java.net.URI;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.app.api.MatchQuery;
import com.app.api.MatchQueryValidator;
import com.app.api.MatchResponse;
import com.app.api.MatchSummaryResponse;
import com.app.service.MatchService;
import com.fasterxml.jackson.databind.JsonNode;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("/matches")
public class MatchController {

    private final MatchService matchService;
    private final MatchQueryValidator queryValidator;

    public MatchController(MatchService matchService, MatchQueryValidator queryValidator) {
        this.matchService = matchService;
        this.queryValidator = queryValidator;
    }

    @Operation(summary = "Joga a partida entre dois clubes com escalação completa")
    @PostMapping
    public ResponseEntity<MatchResponse> play(@RequestBody JsonNode body) {
        MatchResponse match = matchService.play(body);
        return ResponseEntity.created(URI.create("/api/v1/matches/" + match.id())).body(match);
    }

    @Operation(summary = "Lista o histórico de partidas da mais recente para a mais antiga")
    @GetMapping
    public List<MatchSummaryResponse> list(@RequestParam Map<String, String> params) {
        MatchQuery query = queryValidator.parse(params);
        return matchService.list(query);
    }

    @Operation(summary = "Consulta a partida com os seis duelos")
    @GetMapping("/{id}")
    public MatchResponse get(@PathVariable("id") String id) {
        return matchService.get(id);
    }
}
