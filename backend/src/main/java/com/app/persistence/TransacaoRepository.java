package com.app.persistence;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.app.model.TransactionType;

public interface TransacaoRepository extends JpaRepository<Transacao, Integer> {

    List<Transacao> findByClubeId(Integer clubeId);

    boolean existsByClubeIdAndJogadorIdAndTipo(Integer clubeId, Integer jogadorId, TransactionType tipo);
}
