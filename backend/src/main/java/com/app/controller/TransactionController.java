package com.app.controller;

import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.app.api.TransactionQuery;
import com.app.api.TransactionQueryValidator;
import com.app.api.TransactionsResponse;
import com.app.service.TransactionService;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("/clubs/{id}/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final TransactionQueryValidator queryValidator;

    public TransactionController(TransactionService transactionService, TransactionQueryValidator queryValidator) {
        this.transactionService = transactionService;
        this.queryValidator = queryValidator;
    }

    @Operation(summary = "Consulta o histórico de transações do clube com filtros e resumo")
    @GetMapping
    public TransactionsResponse list(@PathVariable("id") String id, @RequestParam Map<String, String> params) {
        TransactionQuery query = queryValidator.parse(params);
        return transactionService.list(id, query);
    }

    @Operation(summary = "Exporta o histórico de transações do clube em CSV")
    @GetMapping("/export")
    public ResponseEntity<byte[]> export(@PathVariable("id") String id, @RequestParam Map<String, String> params) {
        TransactionQuery query = queryValidator.parse(params);
        String csv = transactionService.export(id, query);
        return ResponseEntity.ok()
                .contentType(MediaType.valueOf("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"transactions.csv\"")
                .body(csv.getBytes(StandardCharsets.UTF_8));
    }
}
