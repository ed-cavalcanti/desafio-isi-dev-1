package com.app.persistence;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PartidaRepository extends JpaRepository<Partida, Integer> {

    List<Partida> findByMandanteClubeIdOrVisitanteClubeId(Integer mandanteClubeId, Integer visitanteClubeId);
}
