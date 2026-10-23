package com.app.persistence;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.app.model.ContractStatus;

public interface ContratoRepository extends JpaRepository<Contrato, Integer> {

    Optional<Contrato> findByJogadorIdAndStatus(Integer jogadorId, ContractStatus status);

    List<Contrato> findByClubeId(Integer clubeId);
}
