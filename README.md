# Desafio ISI Dev

Stack do projeto:

- **Frontend**: Next.js (TypeScript) - porta 3000
- **Backend**: Spring Boot (Java) - porta 8080
- **Database**: PostgreSQL 16 - porta 5432

## Pré-requisitos

- Docker e Docker Compose instalados

## Como rodar

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd desafio-isi-dev-1

# Copiar os arquivos de exemplo
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Subir os containers
docker compose up -d --build
```

Aguarde o build finalizar e acesse:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

## Parar os containers

```bash
docker compose down
```

Para remover também os dados do banco:

```bash
docker compose down -v
```

## Bibliotecas do backend

- **spring-boot-starter-web**: servidor HTTP, controllers e serialização JSON snake_case.
- **spring-boot-starter-data-jpa** (Hibernate): persistência com JPA sobre o PostgreSQL.
- **org.postgresql**: driver do banco da aplicação (PostgreSQL 16).
- **flyway-core** e **flyway-database-postgresql**: versionamento das migrações do banco (`V1` a `V6`).
- **springdoc-openapi-starter-webmvc-ui**: documentação OpenAPI/Swagger da API em `/swagger-ui.html`.
- **spring-boot-starter-test** (JUnit, AssertJ, Mockito): testes unitários do backend.

## Decisões do backend

Detalhes que o enunciado deixou em aberto, decididos e aplicados assim:

- **Compra e venda**: `POST /players/{id}/purchase` (corpo com `club_id` e `loyalty_until`) e
  `POST /players/{id}/sale` (sem corpo; um corpo enviado é ignorado). Respondem `200` com os
  valores da operação; `POST /players`, `POST /clubs` e `POST /matches` seguem o enunciado com
  `201` e `Location`.
- **Resposta da compra**: `player_id`, `club_id`, `value`, `fee`, `total_cost`, `loyalty_until`
  e `cash`. **Resposta da venda**: `player_id`, `club_id`, `purchase_value`, `sale_value`,
  `days_remaining`, `penalty_percent`, `penalty`, `profit`, `commission`, `credit` e `cash`.
- **Partidas**: a resposta traz `id`, `home_club_id`, `home_club_name`, `away_club_id`,
  `away_club_name`, `home_goals`, `away_goals`, `result`, `played_at`, `home_formation`,
  `away_formation` e `duels`; cada duelo tem `order`, `attacker`, `defender` e `goal`, e cada
  lado tem `player_id`, `name`, `position`, `condition`, `attribute` e `value`. Em `GET /matches`
  os duelos ficam de fora; em `POST /matches` e `GET /matches/{id}` vêm completos.
- **Datas de entrada**: exatamente `AAAA-MM-DDTHH:MM-03:00`, sem segundos, como manda a RN01;
  qualquer outro formato (inclusive com segundos ou sem o `-03:00`) é recusado com `400`. As
  respostas trazem `AAAA-MM-DDTHH:MM:SS-03:00`.
- **Momento atual**: o instante do servidor expresso no fuso fixo de −03:00, sem horário de
  verão, usado nas regras de data (fidelidade, dias restantes) e nas datas gravadas.
- **Escalação**: `PUT /clubs/{id}/lineup` responde `200` com a escalação, no mesmo formato do
  `GET /clubs/{id}/lineup` (`club_id`, `formation`, `complete` e `players`).
- **Consulta do clube**: o elenco de `GET /clubs/{id}` traz cada jogador como `player` (campos de
  `GET /players/{id}`) e `contract` (`loyalty_until`, `days_remaining` e `penalty_percent`).
- **Nome único do clube**: a coluna `nome_busca` guarda o nome normalizado (V4) em minúsculas e
  tem restrição única no banco; a sigla também é única. Assim, o banco ignora maiúsculas e
  minúsculas sem ignorar acentos, como a RN10.
- **Duelos**: o atributo usado é gravado em minúsculas (`shooting`, `passing`, `dribbling`,
  `defending`), igual aos nomes dos atributos do jogador, e os valores guardados já trazem o
  efeito da condição aplicado na partida.
- **Exportação CSV**: o arquivo sai como `transactions.csv` com `Content-Disposition`, além do
  `text/csv` obrigatório.

## Testes do backend

Os testes unitários do backend usam as bibliotecas JUnit, AssertJ e Mockito,
já incluídas em `spring-boot-starter-test` (não exigem banco de dados nem os containers no ar).

A partir da pasta `backend`:

```bash
# Rodar todos os testes
mvn test
```

Para rodar apenas uma classe:

```bash
mvn test -Dtest=PlayerCalculatorTest
```
