package com.app.controller;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.api.PurchaseResponse;
import com.app.api.SaleResponse;
import com.app.service.MarketService;
import com.fasterxml.jackson.databind.JsonNode;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("/players")
public class MarketController {

    private final MarketService marketService;

    public MarketController(MarketService marketService) {
        this.marketService = marketService;
    }

    @Operation(summary = "Compra um jogador livre para um clube, com contrato de fidelidade")
    @PostMapping("/{id}/purchase")
    public PurchaseResponse purchase(@PathVariable("id") String id, @RequestBody JsonNode body) {
        return marketService.purchase(id, body);
    }

    @Operation(summary = "Vende um jogador do elenco pelo valor de mercado do momento")
    @PostMapping("/{id}/sale")
    public SaleResponse sale(@PathVariable("id") String id) {
        return marketService.sale(id);
    }
}
