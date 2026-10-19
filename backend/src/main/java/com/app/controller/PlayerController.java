package com.app.controller;

import com.app.api.PlayerCreateRequest;
import com.app.api.PlayerListQuery;
import com.app.api.PlayerListQueryValidator;
import com.app.api.PlayerPageResponse;
import com.app.api.PlayerResponse;
import com.app.service.PlayerService;
import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import java.net.URI;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/players")
public class PlayerController {

    private final PlayerService playerService;
    private final PlayerListQueryValidator queryValidator;

    public PlayerController(PlayerService playerService, PlayerListQueryValidator queryValidator) {
        this.playerService = playerService;
        this.queryValidator = queryValidator;
    }

    @Operation(summary = "Lista jogadores paginados")
    @GetMapping
    public PlayerPageResponse list(
            @RequestParam(name = "page", required = false) String page,
            @RequestParam(name = "limit", required = false) String limit) {
        PlayerListQuery query = queryValidator.parse(page, limit);
        return playerService.list(query);
    }

    @Operation(summary = "Cadastra jogador", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                    schema = @Schema(implementation = PlayerCreateRequest.class))))
    @PostMapping
    public ResponseEntity<PlayerResponse> create(@RequestBody JsonNode body) {
        PlayerResponse created = playerService.create(body);
        return ResponseEntity.created(URI.create("/api/v1/players/" + created.id())).body(created);
    }
}
