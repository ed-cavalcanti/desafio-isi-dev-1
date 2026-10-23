package com.app.controller;

import java.net.URI;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.app.api.ClubListQueryValidator;
import com.app.api.ClubRequest;
import com.app.api.ClubResponse;
import com.app.api.ClubSort;
import com.app.service.ClubService;
import com.fasterxml.jackson.databind.JsonNode;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

@RestController
@RequestMapping("/clubs")
public class ClubController {

    private final ClubService clubService;
    private final ClubListQueryValidator queryValidator;

    public ClubController(ClubService clubService, ClubListQueryValidator queryValidator) {
        this.clubService = clubService;
        this.queryValidator = queryValidator;
    }

    @Operation(summary = "Cadastra clube", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = ClubRequest.class))))
    @PostMapping
    public ResponseEntity<ClubResponse> create(@RequestBody JsonNode body) {
        ClubResponse created = clubService.create(body);
        return ResponseEntity.created(URI.create("/api/v1/clubs/" + created.id())).body(created);
    }

    @Operation(summary = "Lista clubes ordenados por nome ou patrimônio")
    @GetMapping
    public List<ClubResponse> list(@RequestParam Map<String, String> params) {
        ClubSort sort = queryValidator.parse(params);
        return clubService.list(sort);
    }
}
