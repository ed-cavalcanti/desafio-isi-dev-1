package com.app.persistence;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface EscalacaoTitularRepository extends JpaRepository<EscalacaoTitular, Integer> {

    List<EscalacaoTitular> findByEscalacaoId(Integer escalacaoId);

    @Modifying
    @Query("delete from EscalacaoTitular t where t.escalacaoId = :escalacaoId")
    void deleteByEscalacaoId(Integer escalacaoId);

    @Modifying
    @Query("delete from EscalacaoTitular t where t.jogadorId = :jogadorId")
    void deleteByJogadorId(Integer jogadorId);
}
