# Order Service

Microservico responsavel pelo ciclo de vida de Ordem de Servico (OS), catalogo, budget e fila de execucao.

## Arquitetura

- Estilo: microsservicos com comunicacao sincrona (REST) e assincrona (RabbitMQ).
- Banco: PostgreSQL.
- Mensageria: RabbitMQ com topico `order.events` para publicacao e `payment.events` para consumo.
- Referencias: `architecture-reference.md` e `plano_order_service_fase4.md`.

## Responsabilidades

- Abrir e atualizar OS com historico de status.
- Gerenciar catalogo de servicos e pecas.
- Gerar, aprovar e rejeitar budget.
- Manter fila de execucao por prioridade.
- Publicar eventos para os demais servicos.

## Ciclo de vida da OS

`RECEIVED -> DIAGNOSIS -> AWAITING_APPROVAL -> APPROVED -> IN_EXECUTION -> COMPLETED -> AWAITING_PAYMENT -> PAID -> DELIVERED`

Fluxos de compensacao:

- `AWAITING_APPROVAL -> REJECTED -> CANCELLED`
- `AWAITING_PAYMENT -> PAYMENT_FAILED -> AWAITING_PAYMENT`

## Saga Pattern

- Estrategia: **Coreografada**.
- Justificativa: reduz acoplamento, distribui responsabilidade de reacao por evento entre servicos.
- Pontos principais:
  - OS publica eventos de negocio (`OS_CREATED`, `BUDGET_GENERATED`, `PAYMENT_REQUESTED`, etc.).
  - Reage a eventos de pagamento (`PAYMENT_CONFIRMED`, `PAYMENT_FAILED`, `PAYMENT_REFUNDED`).

## Eventos publicados e consumidos

Publicados:

- `OS_CREATED` (`order.created`)
- `OS_STATUS_CHANGED` (`order.status.changed`)
- `BUDGET_GENERATED` (`order.budget.generated`)
- `BUDGET_APPROVED` (`order.budget.approved`)
- `BUDGET_REJECTED` (`order.budget.rejected`)
- `EXECUTION_COMPLETED` (`order.execution.completed`)
- `PAYMENT_REQUESTED` (`order.payment.requested`)
- `OS_CANCELLED` (`order.cancelled`)

Consumidos (payment.events):

- `PAYMENT_CONFIRMED`
- `PAYMENT_FAILED`
- `PAYMENT_REFUNDED`

## Como rodar localmente

```bash
npm install
npm run db:up
DATABASE_HOST=localhost DATABASE_PORT=5433 DATABASE_USER=order_service DATABASE_PASSWORD=order_service DATABASE_NAME=order_service npm run migration:run
npm run start
```

## Como rodar os testes

```bash
npm run test -- --runInBand
npm run test:cov
npm run test:bdd
```

## Evidencias de cobertura

- Cobertura validada localmente via `npm run test:cov`.
- Threshold global configurado no `jest.config.ts`.

## Evidencias de pipeline CI/CD

- Workflow: `.github/workflows/ci-cd.yml`.
- Jobs: build/test, build de imagem e deploy (main).

## Link do Swagger

- UI: `http://localhost:3001/docs`
- Spec JSON: `swagger.json` (gerado no bootstrap da aplicacao).

## Tecnologias utilizadas

- NestJS
- TypeORM
- PostgreSQL
- RabbitMQ
- Jest
- Cucumber
- Docker
- Kubernetes

## Docker

```bash
docker build -t order-service:local .
docker run --rm -p 3001:3001 \
  -e DATABASE_HOST=host.docker.internal \
  -e DATABASE_PORT=5433 \
  -e DATABASE_USER=order_service \
  -e DATABASE_PASSWORD=order_service \
  -e DATABASE_NAME=order_service \
  -e RABBITMQ_URL=amqp://guest:guest@host.docker.internal:5672 \
  -e CUSTOMER_SERVICE_URL=http://host.docker.internal:3002 \
  -e ENABLE_NEW_RELIC=false \
  order-service:local
```

## Kubernetes (manifests)

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/migration-job.yaml
```

