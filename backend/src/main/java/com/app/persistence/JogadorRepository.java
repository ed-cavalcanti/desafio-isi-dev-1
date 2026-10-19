package com.app.persistence;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface JogadorRepository extends JpaRepository<Jogador, Integer> {

    List<Jogador> findByExcluidoEmIsNull();

    Optional<Jogador> findByIdAndExcluidoEmIsNull(Integer id);
}
