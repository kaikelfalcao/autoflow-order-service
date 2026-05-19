# ADR-001 — DDD modular com módulos por bounded context

## Contexto

O `order-service` tem cinco sub-domínios distintos: clientes, veículos,
ordem de serviço, orçamento e execução. Cada um com seu próprio agregado,
regras e ciclo de vida.

## Decisão

Estruturar em **módulos por bounded context** dentro do mesmo serviço:

```
src/modules/
├── customers/   { application, domain, infrastructure, presentation }
├── vehicles/    idem
├── order/       idem
├── budget/      idem
└── execution/   idem
```

Cada módulo segue **Clean Architecture light** (use-cases + entidades + ports).

`src/infrastructure/` no topo guarda preocupações cross-cutting:
config, database wiring, http-client, messaging, observability.

## Consequências

**+** Sub-domínios isolados — facilita extrair para microsserviço dedicado
no futuro (ex: customers em service próprio).
**+** Use-cases nomeados (`OpenOrderUseCase`, `ApproveBudgetUseCase`) são
auto-documentados.
**−** Mais arquivos vs MVC plano. Justificado pela complexidade do domínio
de OS.
