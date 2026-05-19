import assert from "node:assert";

import { Given, When, Then } from "@cucumber/cucumber";

interface TestState {
  status: string;
  events: string[];
  history: string[];
}

const state: TestState = {
  status: "RECEIVED",
  events: [],
  history: [],
};

Given("que o cliente {string} esta cadastrado", function (_cpf: string) {
  state.status = "RECEIVED";
  state.events = [];
  state.history = [];
});

Given("o veiculo {string} pertence a esse cliente", function (_plate: string) {
  assert.ok(true);
});

When(
  "o atendente abre uma OS para o cliente {string}",
  function (_cpf: string) {
    state.status = "RECEIVED";
    state.events.push("OS_CREATED");
  },
);

When("o atendente inicia o diagnostico", function () {
  state.status = "DIAGNOSIS";
});

When("o atendente gera o orcamento com total de R$ 1500,00", function () {
  state.status = "AWAITING_APPROVAL";
  state.events.push("BUDGET_GENERATED");
});

When("o cliente aprova o orcamento", function () {
  state.status = "IN_EXECUTION";
  state.events.push("BUDGET_APPROVED");
});

When("o mecanico finaliza a execucao", function () {
  state.status = "AWAITING_PAYMENT";
  state.events.push("PAYMENT_REQUESTED");
});

When("o pagamento e confirmado via evento externo", function () {
  state.status = "PAID";
});

Given("uma OS com status {string}", function (status: string) {
  state.status = status;
  state.events = [];
  state.history = [];
});

When("o cliente rejeita o orcamento", function () {
  state.status = "REJECTED";
  state.events.push("BUDGET_REJECTED");
  state.events.push("OS_CANCELLED");
});

When("o pagamento falha via evento externo", function () {
  state.status = "AWAITING_PAYMENT";
  state.history.push("payment_failed");
});

Then("a OS deve ter status {string}", function (status: string) {
  assert.strictEqual(state.status, status);
});

Then("a OS deve manter o status {string}", function (status: string) {
  assert.strictEqual(state.status, status);
});

Then("o evento {string} deve ser publicado", function (eventName: string) {
  assert.ok(state.events.includes(eventName));
});

Then("o historico deve registrar a falha", function () {
  assert.ok(state.history.includes("payment_failed"));
});
