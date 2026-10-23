package com.app.persistence;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DueloRepository extends JpaRepository<Duelo, Integer> {

    List<Duelo> findByPartidaId(Integer partidaId);
}
