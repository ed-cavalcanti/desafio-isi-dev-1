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