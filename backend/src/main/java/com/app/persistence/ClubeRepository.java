package com.app.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ClubeRepository extends JpaRepository<Clube, Integer> {

    boolean existsByNomeBusca(String nomeBusca);

    boolean existsBySigla(String sigla);
}
