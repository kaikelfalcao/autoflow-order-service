Feature: Ciclo completo de uma Ordem de Servico
  Como atendente da oficina
  Quero abrir e acompanhar uma OS
  Para garantir que o cliente seja atendido corretamente

  Background:
    Given que o cliente "123.456.789-00" esta cadastrado
    And o veiculo "ABC-1234" pertence a esse cliente

  Scenario: Fluxo feliz - da abertura ao pagamento
    When o atendente abre uma OS para o cliente "123.456.789-00"
    Then a OS deve ter status "RECEIVED"
    When o atendente inicia o diagnostico
    Then a OS deve ter status "DIAGNOSIS"
    When o atendente gera o orcamento com total de R$ 1500,00
    Then a OS deve ter status "AWAITING_APPROVAL"
    And o evento "BUDGET_GENERATED" deve ser publicado
    When o cliente aprova o orcamento
    Then a OS deve ter status "IN_EXECUTION"
    And o evento "BUDGET_APPROVED" deve ser publicado
    When o mecanico finaliza a execucao
    Then a OS deve ter status "AWAITING_PAYMENT"
    And o evento "PAYMENT_REQUESTED" deve ser publicado
    When o pagamento e confirmado via evento externo
    Then a OS deve ter status "PAID"

  Scenario: Rollback - cliente rejeita orcamento
    Given uma OS com status "AWAITING_APPROVAL"
    When o cliente rejeita o orcamento
    Then a OS deve ter status "REJECTED"
    And o evento "BUDGET_REJECTED" deve ser publicado
    And o evento "OS_CANCELLED" deve ser publicado

  Scenario: Rollback - pagamento falha
    Given uma OS com status "AWAITING_PAYMENT"
    When o pagamento falha via evento externo
    Then a OS deve manter o status "AWAITING_PAYMENT"
    And o historico deve registrar a falha

