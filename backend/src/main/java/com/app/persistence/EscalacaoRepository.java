package com.app.persistence;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EscalacaoRepository extends JpaRepository<Escalacao, Integer> {

    Optional<Escalacao> findByClubeId(Integer clubeId);
}
