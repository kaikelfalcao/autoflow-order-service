# ADR-002 — Postgres com state machine de status

## Contexto

OS tem transições válidas e inválidas (`RECEIVED → DIAGNOSIS → ...`).
Persistir apenas o status atual perde rastreabilidade.

## Decisão

- Postgres 16 com TypeORM
- Tabela `orders` guarda status atual
- Tabela `order_status_history` (append-only) guarda transições com
  `previousStatus`, `nextStatus`, `changedBy`, `reason`, `at`
- Service `OrderStatusHistoryService` é o único caminho para mudar status,
  validando transições contra um mapa estático.

## Consequências

**+** Auditoria completa sem effort extra (replay reconstrói o estado).
**+** Bug "saltei status" não fica oculto — `transitionStatus` lança quando
a transição é inválida.
**−** Cada mudança escreve 2 rows (orders + history). Aceitável.
