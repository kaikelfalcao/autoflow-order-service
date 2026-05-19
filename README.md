# autoflow-order-service

> Microsserviço **núcleo** do ecossistema **autoflow** (FIAP Tech Challenge — Fase 4). Mantém o ciclo de vida da Ordem de Serviço (OS), do cliente e do veículo, além de orçamentos e fila de execução.

Cinco subdomínios em um mesmo serviço:

- **Order** — OS com state machine (`RECEIVED` → `IN_DIAGNOSIS` → `WAITING_APPROVAL` → `IN_EXECUTION` → `READY` → `DELIVERED`/`CANCELLED`).
- **Budget** — orçamentos vinculados à OS (gerar → aprovar/rejeitar).
- **Execution** — fila de OS em execução para o time da oficina.
- **Customer** — cadastro do cliente (fonte de verdade; consumido por outros serviços via HTTP).
- **Vehicle** — veículos vinculados ao cliente.

---

## 🧱 Stack

| Camada       | Tecnologia                                          |
|--------------|-----------------------------------------------------|
| Runtime      | Node.js 24 (LTS)                                    |
| Linguagem    | TypeScript (strict)                                 |
| Framework    | NestJS 11                                           |
| Banco        | PostgreSQL 16 (TypeORM + migrations)                |
| Mensageria   | RabbitMQ via `amqp-connection-manager`              |
| Resiliência  | opossum (HTTP client p/ identity-service)           |
| Observ.      | New Relic APM + canonical logs (Winston)            |
| Testes       | Jest + Cucumber (BDD)                               |
| Container    | Docker multi-stage                                  |
| Deploy       | EKS via GitHub Actions                              |

Lint via `tsc --noEmit` (sem ESLint configurado neste repo).

---

## 🏛️ Arquitetura

**Hexagonal por feature**. Cada subdomínio em `src/modules/<feature>/` tem sua própria pirâmide `domain → application → infrastructure → presentation`.

```
src/
├── modules/
│   ├── order/        ← OS, state machine, eventos de domínio
│   │   ├── domain/                ← entities, value-objects (OrderStatus)
│   │   ├── application/use-cases  ← open-order, update-status, cancel-order…
│   │   ├── infrastructure/
│   │   │   ├── persistence/       ← TypeORM repo + mapper
│   │   │   └── messaging/         ← order-event-publisher, payment-event-consumer, saga/
│   │   └── presentation/http/     ← OrderController + DTOs
│   ├── budget/       ← orçamentos
│   ├── execution/    ← fila + complete-execution
│   ├── customers/    ← cadastro de cliente (fonte de verdade do CPF)
│   └── vehicles/     ← veículos do cliente
├── infrastructure/
│   ├── config/, database/, http/, http-client/, messaging/, observability/
├── health/
└── shared/           ← filters, logger, middlewares
```

---

## 🌐 Endpoints REST (via Kong)

### Orders — `/orders/*`
| Método | Path                    | Descrição                                  |
|--------|-------------------------|--------------------------------------------|
| POST   | `/orders`               | Abrir OS                                   |
| GET    | `/orders`               | Listar OSs                                 |
| GET    | `/orders/queue`         | Fila operacional                           |
| GET    | `/orders/:id`           | Detalhe da OS                              |
| GET    | `/orders/:id/history`   | Histórico de transições                    |
| PATCH  | `/orders/:id/status`    | Transição manual de status                 |
| POST   | `/orders/:id/items`     | Adicionar item (peça/serviço) à OS         |
| DELETE | `/orders/:id/items/:itemId` | Remover item                           |
| PATCH  | `/orders/:id/cancel`    | Cancelar OS                                |

### Budgets — `/budgets/*`
| Método | Path                | Descrição                                       |
|--------|---------------------|-------------------------------------------------|
| POST   | `/budgets`          | Gerar orçamento para uma OS                     |
| GET    | `/budgets`          | Listar/consultar orçamentos                     |
| POST   | `/budgets/approve`  | Aprovar (publica `order.budget.approved` e `order.payment.requested`) |
| POST   | `/budgets/reject`   | Rejeitar (publica `order.budget.rejected`)      |

### Execution — `/execution/*`
| Método | Path                            | Descrição                          |
|--------|---------------------------------|------------------------------------|
| GET    | `/execution/queue`              | OS em execução                     |
| PATCH  | `/execution/:id/execution`      | Iniciar execução                   |
| POST   | `/execution/:id/execution/complete` | Concluir execução              |

### Customers — `/customers/*`
| Método | Path                                       | Descrição                          |
|--------|--------------------------------------------|------------------------------------|
| POST   | `/customers`                               | Cadastrar cliente                  |
| GET    | `/customers`                               | Listagem                           |
| GET    | `/customers/by-document/:documentNumber`   | Lookup por CPF (consumido pelo identity) |
| GET    | `/customers/:id`                           | Detalhe                            |
| PUT    | `/customers/:id`                           | Atualizar                          |
| DELETE | `/customers/:id`                           | Remover                            |

### Vehicles — `/vehicles/*` & `/customers/:id/vehicles`
| Método | Path                                       | Descrição                          |
|--------|--------------------------------------------|------------------------------------|
| POST   | `/vehicles`                                | Cadastrar veículo                  |
| GET    | `/vehicles`                                | Listagem                           |
| GET    | `/vehicles/:id`                            | Detalhe                            |
| GET    | `/customers/:customerId/vehicles`          | Veículos de um cliente             |
| PUT    | `/vehicles/:id`                            | Atualizar                          |
| DELETE | `/vehicles/:id`                            | Remover                            |

---

## 📬 Eventos RabbitMQ

### Publicados — exchange `order.events` (topic, durable)

| Routing key                       | Quando                                       |
|-----------------------------------|----------------------------------------------|
| `order.created`                   | OS aberta                                    |
| `order.status.changed`            | Mudança de status                            |
| `order.budget.generated`          | Orçamento gerado                             |
| `order.budget.approved`           | Cliente aprovou (consumido pelo saga)        |
| `order.budget.rejected`           | Cliente rejeitou                             |
| `order.execution.completed`       | Execução finalizada (consumido pelo saga)    |
| `order.payment.requested`         | Acompanha approved (consumido pelo billing)  |
| `order.cancelled`                 | OS cancelada                                 |

### Consumidos — exchange `payment.events`

| Queue                              | Binding (routing key)    | Efeito                                |
|------------------------------------|--------------------------|---------------------------------------|
| `order.payment.confirmed`          | `payment.confirmed`      | Promove OS para `IN_EXECUTION`        |
| `order.payment.failed`             | `payment.failed`         | Cancela a OS                          |
| `order.payment.refunded`           | `payment.refunded`       | Marca pagamento como estornado        |

---

## 🔧 Variáveis de ambiente

| Variável              | Default                          | Descrição                            |
|-----------------------|----------------------------------|--------------------------------------|
| `PORT`                | `3001`                           | porta HTTP                            |
| `DATABASE_HOST`       | `localhost`                      |                                      |
| `DATABASE_PORT`       | `5432`                           |                                      |
| `DATABASE_USER`       | `order_service`                  |                                      |
| `DATABASE_PASSWORD`   | —                                |                                      |
| `DATABASE_NAME`       | `order_service`                  |                                      |
| `RABBITMQ_URL`        | `amqp://localhost:5672`          |                                      |
| `IDENTITY_SERVICE_URL`| `http://localhost:3000`          | usado para validar JWT externamente   |
| `JWT_SECRET`          | —                                | mesmo segredo do identity (validação) |
| `NEW_RELIC_LICENSE_KEY` | —                              | (opcional) APM                        |

---

## 🚀 Rodar localmente

```bash
npm install
npm run db:up                # docker-compose Postgres
npm run migration:run
npm run start:dev
```

Integração completa: `cd ../autoflow-infra/local && ./bootstrap.sh`.

---

## 🧪 Testes

```bash
npm run test           # unit
npm run test:cov       # threshold 80% global
npm run test:bdd       # Cucumber (test/bdd/features)
npm run lint           # tsc --noEmit
```

**Coverage:** 100% nos use-cases monitorados pelo `collectCoverageFrom` (open-order, update-status, generate/approve/reject-budget, complete-execution, get-execution-queue).

> **Análise estática:** CodeQL via GitHub Actions (`.github/workflows/codeQL.yml`) — varredura de segurança em pushes na `main` e em pull requests.

---

## 🐳 Docker / ☸️ Deploy

| Workflow | Trigger                          | Jobs                              |
|----------|----------------------------------|-----------------------------------|
| `ci.yml` | push/PR em qualquer branch       | lint + build + test:cov + bdd     |
| `cd.yml` | `workflow_run` (CI ok em `main`) | DockerHub build & push + EKS rollout |

Imagem: `kaikelfalcao/autoflow-order:<sha>`. Cluster `autoflow-dev-eks` / namespace `autoflow`.

---

## 📊 Observabilidade

- Logs canônicos por request HTTP **e** por evento RabbitMQ processado.
- Circuit breaker (`opossum`) para chamadas ao `identity-service`; emite `OrderServiceCircuitOpen` no New Relic.
- Custom events: `OrderCreated`, `BudgetApproved`, `BudgetRejected`, `OrderStatusChanged`.

---

## 🔗 Ecossistema

[`autoflow-infra`](https://github.com/kaikelfalcao/autoflow-infra) · [`autoflow-identity-service`](https://github.com/kaikelfalcao/autoflow-identity-service) · [`autoflow-catalog-service`](https://github.com/kaikelfalcao/autoflow-catalog-service) · [`autoflow-payment-service`](https://github.com/kaikelfalcao/autoflow-payment-service) · [`autoflow-saga-orchestrator`](https://github.com/kaikelfalcao/autoflow-saga-orchestrator) · [`autoflow-notification-service`](https://github.com/kaikelfalcao/autoflow-notification-service)
