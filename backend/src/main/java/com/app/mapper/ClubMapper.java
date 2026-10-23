package com.app.mapper;

import java.math.BigDecimal;
import java.util.Locale;

import org.springframework.stereotype.Component;

import com.app.api.ClubRequest;
import com.app.api.ClubResponse;
import com.app.model.BrasiliaTime;
import com.app.persistence.Clube;

/**
 * Tradução entre o clube persistido ({@link Clube}) e os contratos da API
 * ({@link ClubRequest} e {@link ClubResponse}).
 */
@Component
public class ClubMapper {

    public Clube toEntity(ClubRequest request) {
        Clube clube = new Clube();
        clube.nome(request.name());
        clube.nomeBusca(searchKey(request.name()));
        clube.sigla(request.acronym());
        clube.caixa(new BigDecimal("300.00"));
        clube.criadoEm(BrasiliaTime.now());
        return clube;
    }

    /**
     * Chave de unicidade do nome: o nome normalizado em minúsculas, para
     * ignorar maiúsculas e minúsculas sem ignorar acentos (RN10).
     */
    public String searchKey(String name) {
        return name.toLowerCase(Locale.ROOT);
    }

    public ClubResponse toResponse(Clube clube, BigDecimal squadValue) {
        return new ClubResponse(clube.id(), clube.nome(), clube.sigla(), clube.caixa(), squadValue,
                clube.caixa().add(squadValue));
    }
}
