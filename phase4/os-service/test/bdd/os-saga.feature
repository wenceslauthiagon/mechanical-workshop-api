Feature: Saga de Ordem de Serviço
  Como sistema de oficina mecânica
  Quero coordenar OS, faturamento e execução
  Para garantir consistência distribuída com compensação em falhas

  Scenario: Fluxo completo com sucesso
    Given uma ordem de serviço aberta
    When o orçamento é gerado
    And o orçamento é aprovado
    And o pagamento é confirmado
    And a execução é iniciada
    And a execução é concluída
    Then a OS deve finalizar como COMPLETED

  Scenario: Compensação por falha no pagamento
    Given uma ordem de serviço aberta
    When o orçamento é gerado
    And o orçamento é aprovado
    And o pagamento falha
    Then a OS deve ser cancelada

  Scenario: Compensação por falha na execução
    Given uma ordem de serviço aberta com orçamento aprovado e pagamento confirmado
    When a execução falha
    Then a OS deve ser cancelada
