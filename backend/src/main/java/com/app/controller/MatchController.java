package com.app.controller;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.api.MatchResponse;
import com.app.service.MatchService;
import com.fasterxml.jackson.databind.JsonNode;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("/matches")
public class MatchController {

    private final MatchService matchService;

    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    @Operation(summary = "Joga a partida entre dois clubes com escalação completa")
    @PostMapping
    public ResponseEntity<MatchResponse> play(@RequestBody JsonNode body) {
        MatchResponse match = matchService.play(body);
        return ResponseEntity.created(URI.create("/api/v1/matches/" + match.id())).body(match);
    }
}
