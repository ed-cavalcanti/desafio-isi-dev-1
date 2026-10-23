package com.app.persistence;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EscalacaoTitularRepository extends JpaRepository<EscalacaoTitular, Integer> {

    List<EscalacaoTitular> findByEscalacaoId(Integer escalacaoId);

    void deleteByEscalacaoId(Integer escalacaoId);

    void deleteByJogadorId(Integer jogadorId);
}
