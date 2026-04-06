Feature: Fluxo completo de OS

  Scenario: abrir OS e concluir fluxo principal
    Given existe uma ordem de serviço aberta
    When o pagamento é confirmado
    And a execução é concluída
    Then a ordem deve ficar com status COMPLETED
