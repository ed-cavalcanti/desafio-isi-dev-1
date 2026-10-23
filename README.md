# Desafio ISI Dev — Mercado de Jogadores

Aplicação fullstack para o estudo de caso do mercado de jogadores de uma liga de futebol
fictícia. O backend concentra todas as regras de negócio (RN01 a RN21) e o frontend percorre
o fluxo completo pela interface: jogadores, clubes, compra, venda, histórico, escalação,
partidas e classificação.

- **Frontend:** Next.js 16 + React 18 + TypeScript — `http://localhost:3000`
- **Backend:** Spring Boot 3.3.5 + Java 21 — `http://localhost:8080`
- **Banco:** PostgreSQL 16 — `localhost:5432`, banco `appdb`
- **API:** base `http://localhost:8080/api/v1`

## 1. Pré-requisitos

Para subir tudo com um único comando (cenário de correção):

- **Docker Engine** 24 ou superior
- **Docker Compose** v2 (comando `docker compose`)
- **Git** para clonar o repositório

Para rodar backend e frontend fora dos containers:

- **Java 21** (JDK) e **Maven** 3.9 ou superior
- **Node.js 20 LTS ou 22 LTS** com **npm** 10 ou superior
- **PostgreSQL 16** (ou o container `db` do Compose)

## 2. Banco de dados: criar e recriar do zero

As migrações ficam em `backend/src/main/resources/db/migration` (Flyway, `V1` a `V7`) e são
executadas automaticamente quando o backend sobe. O banco criado por esses passos começa
**vazio**: sem jogadores, clubes, transações ou partidas. Não há carga de dados de exemplo.

Criar o banco e subir apenas o PostgreSQL (na raiz do repositório):

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up -d db
```

O backend cria as tabelas ao iniciar:

```bash
docker compose up -d backend
```

Recriar o banco do zero (apaga o volume e roda todas as migrações novamente):

```bash
docker compose down -v
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up -d db backend
```

Alternativa com PostgreSQL instalado na máquina, sem container:

```bash
createdb -h localhost -U postgres appdb
```

e informe `SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/appdb` ao backend. As
migrações rodam no start da aplicação.

## 3. Instalar e executar

### 3.1 Tudo com Docker Compose (recomendado)

```bash
# na raiz do repositório
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

docker compose up -d --build
```

Aguarde o build do backend e do frontend. Depois:

- **Frontend:** `http://localhost:3000`
- **API (origem sem `/api/v1`):** `http://localhost:8080`
- **Swagger UI:** `http://localhost:8080/api/v1/swagger-ui.html`
- **OpenAPI JSON:** `http://localhost:8080/api/v1/api-docs`
- **Health check:** `http://localhost:8080/api/v1/health`

O `docker compose` define `BACKEND_URL=http://backend:8080` para o frontend. O Next.js
repassa as chamadas de `/api/v1/*` para o backend. No navegador, o frontend conversa apenas
com a própria origem; a API libera CORS somente para `http://localhost:3000` (configurável por
`CORS_ALLOWED_ORIGIN`). Todas as imagens usadas são públicas (`postgres`, `maven`, `eclipse-temurin`
e `node`) e as dependências vêm de registros públicos; o `frontend/package-lock.json` está
versionado para a instalação reproduzível.

Ver logs:

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

Parar os containers:

```bash
docker compose down
```

Parar e remover o banco (volume):

```bash
docker compose down -v
```

### 3.2 Backend e frontend fora dos containers

Banco:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up -d db
```

Backend (em um terminal, na pasta `backend`):

```bash
cp .env.example .env
# ajuste backend/.env para apontar para o banco local:
# SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/appdb
mvn spring-boot:run
# API em http://localhost:8080 (a base é /api/v1)
```

Frontend (em outro terminal, na pasta `frontend`):

```bash
cp .env.example .env
npm ci
npm run dev
# interface em http://localhost:3000
```

Build de produção do frontend:

```bash
npm run build
npm run start
```

## 4. Variáveis de ambiente

Arquivos de exemplo versionados: `backend/.env.example` e `frontend/.env.example`.

### Backend (`backend/.env`)

| Variável | Exemplo | Uso |
| --- | --- | --- |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://db:5432/appdb` | URL do PostgreSQL (use `localhost` fora do Compose) |
| `SPRING_DATASOURCE_USERNAME` | `postgres` | Usuário do banco |
| `SPRING_DATASOURCE_PASSWORD` | `postgres` | Senha do banco |
| `CORS_ALLOWED_ORIGIN` | `http://localhost:3000` | Única origem liberada no CORS (não use `*`) |

### Frontend (`frontend/.env`)

| Variável | Exemplo | Uso |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Destino do proxy/rewrite de `/api/v1` no desenvolvimento local |
| `BACKEND_URL` | `http://backend:8080` | Destino do proxy dentro do Docker Compose (sobrepõe a anterior) |

## 5. Estrutura de pastas

```text
.
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/app/
│       │   ├── api/          # requests, responses, validadores e tratamento de erros
│       │   ├── config/       # CORS e OpenAPI
│       │   ├── controller/   # endpoints REST
│       │   ├── mapper/       # tradução entidade <-> contrato da API
│       │   ├── model/        # cálculos e enums das regras de negócio
│       │   ├── persistence/  # entidades e repositórios JPA
│       │   └── service/      # orquestração das regras de negócio
│       ├── main/resources/
│       │   ├── application.properties
│       │   └── db/migration/ # V1..V7 (Flyway)
│       └── test/java/com/app # testes unitários e de repositório
├── frontend/
│   ├── app/                  # rotas Next.js (players, clubs, matches, classification)
│   ├── components/           # componentes reutilizáveis e de tela
│   ├── hooks/                # hooks compartilhados
│   ├── lib/                  # cliente HTTP, tipos, formatação e validações de formulário
│   └── public/
├── docker-compose.yml
└── README.md
```

## 6. Bibliotecas utilizadas e por quê

### Backend (`backend/pom.xml`)

| Biblioteca | Motivo |
| --- | --- |
| `spring-boot-starter-web` | Servidor HTTP, controllers REST, Jackson e serialização em `snake_case` |
| `spring-boot-starter-data-jpa` (Hibernate) | Persistência e mapeamento objeto-relacional sobre o PostgreSQL |
| `org.postgresql:postgresql` | Driver JDBC do banco da aplicação (PostgreSQL 16) |
| `flyway-core` + `flyway-database-postgresql` | Migrações versionadas e recriação determinística do schema (`V1` a `V7`) |
| `springdoc-openapi-starter-webmvc-ui` | Documentação interativa OpenAPI/Swagger dos endpoints |
| `spring-boot-starter-test` | JUnit 5, AssertJ e Mockito para os testes automatizados |
| `com.h2database:h2` (escopo `test`) | Banco em memória **somente nos testes**; a aplicação não usa H2 em runtime |

### Frontend (`frontend/package.json`)

| Biblioteca | Motivo |
| --- | --- |
| `next`, `react`, `react-dom` | Framework, renderização e roteamento das telas |
| `typescript` | Tipagem estática do frontend |
| `tailwindcss` + `@tailwindcss/postcss` | Estilo utilitário e design system |
| `@base-ui/react` | Primitivos acessíveis de diálogo, select, menu, abas e tooltip |
| `class-variance-authority` | Variantes tipadas dos componentes de UI |
| `cn` | Combinação e resolução de classes CSS |
| `lucide-react` | Ícones da interface |
| `tw-animate-css` | Animações utilitárias do Tailwind |
| `shadcn` | CLI usada para gerar a base dos componentes de UI (não é importada em runtime) |

## 7. Decisões e premissas

Detalhes que o enunciado deixou em aberto ou que precisaram de um formato explícito:

- **Compra e venda:** `POST /players/{id}/buy` (corpo `club_id` e `loyalty_until`) e
  `POST /players/{id}/sell` (sem corpo; corpo enviado é ignorado). Respondem `200`.
  `POST /players`, `POST /clubs` e `POST /matches` respondem `201` com `Location`.
- **Resposta da compra:** os campos da transação (`id`, `club_id`, `player_id`,
  `player_name`, `type`, `value`, `fee`, `penalty`, `profit`, `cash_change`, `created_at`),
  `contract` (`purchase_value`, `loyalty_until`, `status`), `club_cash` e, como campo
  adicional, `total_cost`.
- **Resposta da venda:** `id`, `club_id`, `player_id`, `player_name`, `type`, `value`,
  `fee` (comissão), `penalty`, `profit`, `cash_change` (crédito), `created_at`,
  `purchase_value`, `remaining_days`, `penalty_rate`, `contract_status` e `club_cash`.
  A comissão também é exibida como `fee`, e o crédito como `cash_change`, seguindo a
  transação gravada.
- **Elenco do clube:** cada item de `GET /clubs/{id}` traz os campos de `GET /players/{id}`
  no próprio item e o `contract` (`purchase_value`, `loyalty_until`, `remaining_days`,
  `penalty_rate`).
- **Partidas:** a resposta traz os campos planos (`home_club_id`, `home_goals`, etc.), os
  objetos `home`/`away` (`club_id`, `club_name`, `formation`, `goals`) e os 6 `duels`. Cada
  duelo tem `order`, `attacking_club_id`, `attacker`, `defender` e `goal`; cada lado tem
  `player_id`, `player_name`, `position`, `condition`, `attribute` e `value`.
  `GET /matches` devolve o mesmo formato sem `duels`.
- **Datas de entrada:** exatamente `AAAA-MM-DDTHH:MM-03:00`, sem segundos; qualquer outro
  formato (inclusive com segundos ou sem `-03:00`) é recusado com `400`. As respostas usam
  `AAAA-MM-DDTHH:MM:SS-03:00`.
- **Momento atual:** relógio do servidor no fuso fixo de −03:00, sem horário de verão, usado
  nas regras de fidelidade e nas datas gravadas.
- **Escalação:** a formação fica em `clubes.formacao`; os titulares ficam em `escalacoes`
  com chave composta `(clube_id, jogador_id)` e `jogador_id` único. `PUT /clubs/{id}/lineup`
  substitui a escalação inteira e responde no mesmo formato do `GET`.
- **Banco:** nomes de tabelas e colunas em português e `snake_case`, como no enunciado.
  `clubes.nome_busca` é uma coluna adicional normalizada para garantir a unicidade do nome
  sem diferenciar maiúsculas e minúsculas, mas considerando acentos.
- **Duelos:** o atributo usado é gravado em minúsculas (`shooting`, `passing`, `dribbling`,
  `defending`) e os valores gravados já trazem o efeito da condição da partida.
- **CSV:** UTF-8 sem BOM, linhas terminadas em `\n`, separador `;`, valores com vírgula
  decimal e nome entre aspas quando contém `;` ou aspas. `Content-Disposition` é enviado
  como `transactions.csv`.
- **CORS:** apenas a origem configurada em `CORS_ALLOWED_ORIGIN`; `*` não é usado.
- **Validações:** a ordem é formato/tipo → recurso inexistente → regra de negócio, com um
  único erro por requisição. Campos calculados ou de outros endpoints são ignorados (V7).
- **Ordenação alfabética:** minúsculas, acentos removidos (NFD + remoção de `Mn`) e
  comparação Unicode; empate desfeito pelo id crescente.
- **Frontend:** as abas “Todos”, “Livres” e “Com clube” implementam o filtro de jogadores
  livres; com “Livres” o filtro por clube fica desabilitado para não gerar a combinação
  recusada pela API. Valores e datas são apenas formatados; nada que a API devolve é
  recalculado. O custo total da compra é a soma de `value` + `fee`, permitida pelo enunciado.
- **Endpoints adicionais:** `GET /api/v1/health` e a documentação Swagger/OpenAPI.

## 8. Aderência às regras de negócio

Todas as regras do enunciado estão implementadas no backend e cobertas por testes
automatizados nos cálculos e validadores:

| Regra | Implementação |
| --- | --- |
| RN01 | `BrasiliaTime` (entrada estrita, saída com segundos, fuso −03:00) |
| RN02–RN05 | `PlayerCalculator.marketValue` e testes de valor de mercado |
| RN06 | `PlayerCalculator.overall` / `baseValue`; valor base gravado uma vez |
| RN07 | `PlayerService.list` (busca sem acento, filtros, ordenação e paginação) |
| RN08–RN09 | `PlayerService.update` / `delete` (exclusão lógica) |
| RN10–RN11 | `ClubService` (nome/sigla únicos, 20 clubes, elenco e patrimônio) |
| RN12–RN14 | `MarketService.purchase` (taxa, limite de 50%, elenco de 12 e recompra) |
| RN15–RN16 | `MarketCalculator` e `MarketService.sale` (multa, comissão e crédito) |
| RN17–RN18 | `TransactionService` (histórico, `summary` e CSV) |
| RN19 | `LineupService` (formações, titulares e remoção por venda/DOENTE) |
| RN20–RN21 | `MatchCalculator`, `MatchService` e `StandingsService` |

## 9. Testes do backend

Os testes usam JUnit 5, AssertJ e Mockito (`spring-boot-starter-test`). Os testes de
repositório usam H2 em memória apenas no ambiente de teste; não é necessário subir os
containers. A suíte termina sozinha e verifica, entre outros pontos, o cálculo do valor de
mercado (RN02 a RN05), o overall/valor base, taxa, multa, comissão, validação de corpos e
consultas, escalação e partidas. A suíte atual tem **162 testes**, todos aprovados.

Na pasta `backend`:

```bash
mvn test
```

Para uma classe específica:

```bash
mvn test -Dtest=PlayerCalculatorTest
```

## 10. Funcionalidades não implementadas

- **Obrigatórias:** nenhuma pendente.
- **Diferenciais não implementados:** testes automatizados no frontend; lint e formatação
  no backend; lint e formatação no frontend; registro de logs de cada requisição.
- **Diferenciais implementados:** testes automatizados no backend, Docker Compose com um
  único comando e documentação interativa Swagger/OpenAPI.

## 11. Uso de inteligência artificial

Utilizei o **Command Code**, um assistente de código com IA, como apoio ao desenvolvimento.
Ele foi usado para:

- revisar o enunciado e transformar as regras RN01–RN21 em checklist de implementação;
- sugerir a estrutura de camadas, nomes e contratos de request/response do backend;
- auxiliar na escrita e revisão de testes unitários, validadores e componentes do frontend;
- revisar o schema e as migrações Flyway em relação às tabelas obrigatórias;
- revisar e atualizar este README.

Como usei: o assistente atuou como par de programação; cada sugestão foi lida, adaptada e
validada com `mvn test`, `npm run build` e chamadas reais à API contra PostgreSQL. As regras
de negócio foram conferidas diretamente contra o enunciado e seus exemplos numéricos.

O que aceitei, alterei ou descartei: aceitei sugestões de organização de camadas, nomes e
casos de teste; alterei contratos de resposta e endpoints para ficarem exatamente como o
enunciado determina; descartei sugestões que conflitavam com as regras (por exemplo, CORS
permissivo, rotas de compra/venda fora do contrato e tabelas/colunas com nomes diferentes
dos obrigatórios).
