ALTER TABLE clubes ADD COLUMN formacao VARCHAR(5);
ALTER TABLE clubes ADD CONSTRAINT clubes_formacao_check CHECK (formacao IN ('3-1', '2-2', '2-1-1', '1-2-1'));
ALTER TABLE clubes ALTER COLUMN caixa TYPE DECIMAL(10, 2);
ALTER TABLE clubes ALTER COLUMN caixa SET DEFAULT 300.00;

UPDATE clubes c SET formacao = e.formacao FROM escalacoes e WHERE e.clube_id = c.id;

ALTER TABLE contratos RENAME COLUMN status TO situacao;
ALTER TABLE contratos RENAME COLUMN criado_em TO iniciado_em;
ALTER TABLE contratos ADD COLUMN encerrado_em TIMESTAMP;
UPDATE contratos SET encerrado_em = atualizado_em WHERE situacao <> 'ATIVO';
ALTER TABLE contratos DROP COLUMN atualizado_em;
ALTER TABLE contratos ALTER COLUMN valor_compra TYPE DECIMAL(6, 2);
ALTER TABLE contratos RENAME CONSTRAINT contratos_status_check TO contratos_situacao_check;

ALTER TABLE partidas RENAME COLUMN mandante_clube_id TO mandante_id;
ALTER TABLE partidas RENAME COLUMN visitante_clube_id TO visitante_id;
ALTER TABLE partidas RENAME COLUMN jogado_em TO jogada_em;

ALTER TABLE duelos ADD COLUMN clube_atacante_id INTEGER;
UPDATE duelos d
SET clube_atacante_id = CASE WHEN d.ordem <= 3 THEN p.mandante_id ELSE p.visitante_id END
FROM partidas p
WHERE p.id = d.partida_id;
ALTER TABLE duelos ALTER COLUMN clube_atacante_id SET NOT NULL;
ALTER TABLE duelos ADD CONSTRAINT duelos_clube_atacante_fk FOREIGN KEY (clube_atacante_id) REFERENCES clubes (id);
ALTER TABLE duelos RENAME TO duelos_partida;
ALTER TABLE duelos_partida RENAME COLUMN atacante_jogador_id TO atacante_id;
ALTER TABLE duelos_partida RENAME COLUMN atacante_nome TO nome_atacante;
ALTER TABLE duelos_partida RENAME COLUMN atacante_posicao TO posicao_atacante;
ALTER TABLE duelos_partida RENAME COLUMN atacante_condicao TO condicao_atacante;
ALTER TABLE duelos_partida RENAME COLUMN atacante_atributo TO atributo_ataque;
ALTER TABLE duelos_partida ALTER COLUMN atributo_ataque TYPE VARCHAR(10);
ALTER TABLE duelos_partida RENAME COLUMN atacante_valor TO valor_ataque;
ALTER TABLE duelos_partida RENAME COLUMN defensor_jogador_id TO defensor_id;
ALTER TABLE duelos_partida RENAME COLUMN defensor_nome TO nome_defensor;
ALTER TABLE duelos_partida RENAME COLUMN defensor_posicao TO posicao_defensor;
ALTER TABLE duelos_partida RENAME COLUMN defensor_condicao TO condicao_defensor;
ALTER TABLE duelos_partida RENAME COLUMN defensor_atributo TO atributo_defesa;
ALTER TABLE duelos_partida ALTER COLUMN atributo_defesa TYPE VARCHAR(10);
ALTER TABLE duelos_partida RENAME COLUMN defensor_valor TO valor_defesa;
ALTER TABLE duelos_partida ADD CONSTRAINT duelos_atacante_fk FOREIGN KEY (atacante_id) REFERENCES jogadores (id);
ALTER TABLE duelos_partida ADD CONSTRAINT duelos_defensor_fk FOREIGN KEY (defensor_id) REFERENCES jogadores (id);

ALTER TABLE transacoes ALTER COLUMN jogador_nome TYPE VARCHAR(100);
ALTER TABLE transacoes RENAME COLUMN jogador_nome TO nome_jogador;
ALTER TABLE transacoes ALTER COLUMN tipo TYPE VARCHAR(6);
ALTER TABLE transacoes ALTER COLUMN valor TYPE DECIMAL(6, 2);
ALTER TABLE transacoes ALTER COLUMN taxa TYPE DECIMAL(6, 2);
ALTER TABLE transacoes ALTER COLUMN multa TYPE DECIMAL(6, 2);
ALTER TABLE transacoes ALTER COLUMN lucro TYPE DECIMAL(7, 2);

CREATE TABLE escalacoes_novo (
    clube_id INTEGER NOT NULL,
    jogador_id INTEGER NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT escalacoes_novo_pkey PRIMARY KEY (clube_id, jogador_id),
    CONSTRAINT escalacoes_novo_jogador_uk UNIQUE (jogador_id),
    CONSTRAINT escalacoes_novo_clube_fk FOREIGN KEY (clube_id) REFERENCES clubes (id),
    CONSTRAINT escalacoes_novo_jogador_fk FOREIGN KEY (jogador_id) REFERENCES jogadores (id)
);

INSERT INTO escalacoes_novo (clube_id, jogador_id, criado_em)
SELECT DISTINCT ON (t.jogador_id) e.clube_id, t.jogador_id, COALESCE(e.atualizado_em, CURRENT_TIMESTAMP)
FROM escalacao_titulares t
JOIN escalacoes e ON e.id = t.escalacao_id
ORDER BY t.jogador_id, e.id DESC;

DROP TABLE escalacao_titulares;
DROP TABLE escalacoes;
ALTER TABLE escalacoes_novo RENAME TO escalacoes;
ALTER TABLE escalacoes RENAME CONSTRAINT escalacoes_novo_pkey TO escalacoes_pkey;
ALTER TABLE escalacoes RENAME CONSTRAINT escalacoes_novo_jogador_uk TO escalacoes_jogador_uk;
ALTER TABLE escalacoes RENAME CONSTRAINT escalacoes_novo_clube_fk TO escalacoes_clube_fk;
ALTER TABLE escalacoes RENAME CONSTRAINT escalacoes_novo_jogador_fk TO escalacoes_jogador_fk;
