# ADR-003 — Envelope padrão de evento + idempotência via correlationId

## Contexto

O `order-service` é produtor central de eventos: orquestra o fluxo da OS via
mensagens consumidas por saga, payment e notification.

## Decisão

- Exchange `order.events` (topic, durable)
- Routing keys: `order.created`, `order.budget.generated`,
  `order.budget.approved`, `order.cancelled`, `order.execution.completed`,
  `order.payment.requested`
- Envelope padrão para todo evento publicado:

  ```ts
  {
    eventId: uuid,
    correlationId: orderId,  // permite consumidores casarem idempotência por orderId
    occurredAt: ISO-8601,
    eventType: 'OS_CREATED' | ...,
    payload: { ... }
  }
  ```

- Consumidores devem ser idempotentes — eles tratam o mesmo
  `correlationId` mais de uma vez sem efeitos colaterais (saga já faz isso
  via índice único em `saga_id`).

## Consequências

**+** Contrato uniforme — todos os 3 consumers usam o mesmo parser.
**+** Idempotência empurrada para o consumer, não para o publisher.
**−** Publisher precisa lembrar de incluir o envelope corretamente — bug em
um campo afeta todos os consumers. Mitigado por testes BDD.
