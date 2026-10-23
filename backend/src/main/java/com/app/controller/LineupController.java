package com.app.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.api.LineupResponse;
import com.app.service.LineupService;
import com.fasterxml.jackson.databind.JsonNode;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("/clubs/{id}/lineup")
public class LineupController {

    private final LineupService lineupService;

    public LineupController(LineupService lineupService) {
        this.lineupService = lineupService;
    }

    @Operation(summary = "Substitui a escalação do clube pelos cinco titulares")
    @PutMapping
    public LineupResponse put(@PathVariable("id") String id, @RequestBody JsonNode body) {
        return lineupService.put(id, body);
    }

    @Operation(summary = "Consulta a escalação atual do clube")
    @GetMapping
    public LineupResponse get(@PathVariable("id") String id) {
        return lineupService.get(id);
    }
}
