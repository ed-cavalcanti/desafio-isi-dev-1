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
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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

    @Operation(summary = "Lista jogadores com busca, filtros, ordenação e paginação")
    @GetMapping
    public PlayerPageResponse list(@RequestParam Map<String, String> params) {
        PlayerListQuery query = queryValidator.parse(params);
        return playerService.list(query);
    }

    @Operation(summary = "Consulta jogador por id")
    @GetMapping("/{id}")
    public PlayerResponse get(@PathVariable("id") String id) {
        return playerService.get(id);
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

    @Operation(summary = "Edita nome, posição, agilidade e idade do jogador")
    @PutMapping("/{id}")
    public PlayerResponse update(@PathVariable("id") String id, @RequestBody JsonNode body) {
        return playerService.update(id, body);
    }

    @Operation(summary = "Altera a condição física do jogador")
    @PatchMapping("/{id}/condition")
    public PlayerResponse changeCondition(@PathVariable("id") String id, @RequestBody JsonNode body) {
        return playerService.changeCondition(id, body);
    }

    @Operation(summary = "Exclui logicamente um jogador livre")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") String id) {
        playerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
