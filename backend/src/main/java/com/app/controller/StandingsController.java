package com.app.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.api.StandingResponse;
import com.app.service.StandingsService;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("/standings")
public class StandingsController {

    private final StandingsService standingsService;

    public StandingsController(StandingsService standingsService) {
        this.standingsService = standingsService;
    }

    @Operation(summary = "Consulta a classificação calculada da liga")
    @GetMapping
    public List<StandingResponse> standings() {
        return standingsService.standings();
    }
}
