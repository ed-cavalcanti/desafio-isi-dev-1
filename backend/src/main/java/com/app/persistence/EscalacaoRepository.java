package com.app.persistence;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EscalacaoRepository extends JpaRepository<Escalacao, EscalacaoId> {

    List<Escalacao> findByClubeId(Integer clubeId);

    @Modifying
    @Query("delete from Escalacao e where e.clubeId = :clubeId")
    void deleteByClubeId(@Param("clubeId") Integer clubeId);

    @Modifying
    @Query("delete from Escalacao e where e.jogadorId = :jogadorId")
    void deleteByJogadorId(@Param("jogadorId") Integer jogadorId);
}
