export const ERROR_MESSAGES = {
  // Mensagens gerais
  CONNECTION_REFUSED: 'Connection refused - service may be down',
  UNKNOWN_ERROR: 'Unknown error',
  UNEXPECTED_ERROR: 'Unexpected error',

  // Debug/Log messages
  EXCEPTION_CAUGHT: 'Exception caught',
  ERROR_HANDLER_THREW_EXCEPTION: 'ErrorHandlerService threw exception',
  FALLBACK_TO_500_ERROR: 'Fallback to 500 error - unhandled exception type',

  // Autenticação
  INVALID_CREDENTIALS: 'Credenciais inválidas',
  INVALID_TOKEN: 'Token inválido',
  TOKEN_EXPIRED: 'Token inválido ou expirado',
  ACCESS_TOKEN_NOT_FOUND: 'Access token not found',
  INVALID_ACCESS_TOKEN: 'Invalid access token',
  ACCESS_DENIED_ADMIN_REQUIRED: 'Acesso negado - Role ADMIN necessário',
  PASSWORD_CONFIRMATION_MISMATCH:
    'A confirmação de senha deve ser igual à senha',
  USERS_ALREADY_EXIST:
    'Já existem usuários no sistema. Use o endpoint padrão para criar novos usuários.',
  USERNAME_ALREADY_EXISTS: 'Username já está em uso. Por favor, escolha outro.',
  EMAIL_USER_ALREADY_EXISTS: 'Email já está em uso. Por favor, escolha outro.',
  FIELD_ALREADY_EXISTS: 'já está em uso. Por favor, escolha outro.',

  // Cliente
  CLIENT_NOT_FOUND: 'Cliente não encontrado',
  EMAIL_ALREADY_EXISTS: 'Email já cadastrado no sistema',
  DOCUMENT_ALREADY_EXISTS: 'CPF/CNPJ já cadastrado no sistema',
  INVALID_DOCUMENT: 'Documento inválido. Informe um CPF ou CNPJ válido',
  CLIENT_HAS_VEHICLES:
    'Não é possível remover cliente com veículos cadastrados',
  CLIENT_HAS_REGISTERED_VEHICLES: 'Cliente possui veículos cadastrados',
  EMAIL_OR_DOCUMENT_ALREADY_EXISTS: 'Email ou documento já cadastrado',
  CLIENT_CREATE_ERROR: 'Erro ao criar cliente',
  CLIENT_UPDATE_ERROR: 'Erro ao atualizar cliente',
  CLIENT_DELETE_ERROR: 'Erro ao remover cliente',
  CLIENT_OR_NO_SERVICE_ORDERS:
    'Cliente não encontrado ou sem ordens de serviço',

  // Veículo
  VEHICLE_NOT_FOUND: 'Veículo não encontrado',
  LICENSE_PLATE_ALREADY_EXISTS: 'Placa já cadastrada no sistema',
  VEHICLE_NOT_BELONGS_TO_CLIENT: 'Veículo não pertence ao cliente informado',
  VEHICLE_HAS_SERVICE_ORDERS:
    'Não é possível remover veículo com ordens de serviço vinculadas',
  VEHICLE_WITH_SERVICE_ORDERS: 'Veículo possui ordens de serviço vinculadas',
  VEHICLE_OR_NO_SERVICE_ORDERS:
    'Veículo não encontrado ou sem ordens de serviço',

  // Ordem de Serviço
  SERVICE_ORDER_NOT_FOUND: 'Ordem de serviço não encontrada',
  SERVICE_ORDER_NOT_AWAITING_APPROVAL:
    'Ordem de serviço não está aguardando aprovação',
  MECHANIC_REQUIRED_FOR_EXECUTION:
    'Para iniciar a execução, é necessário atrelar um mecânico à ordem de serviço.',
  MECHANIC_BUSY_WITH_OTHER_ORDER:
    'Mecânico já está ocupado executando outra ordem de serviço.',

  // Serviço
  SERVICE_NOT_FOUND: 'Serviço não encontrado',
  SERVICE_NAME_ALREADY_EXISTS: 'Serviço com este nome já existe',
  SERVICE_ALREADY_REGISTERED: 'Serviço já cadastrado',
  SERVICE_NOT_FOUND_OR_NO_EXECUTION_DATA:
    'Serviço não encontrado ou sem dados de execução',
  SERVICE_NOT_FOUND_OR_INSUFFICIENT_DATA:
    'Serviço não encontrado ou sem dados de execução suficientes',

  // Peça
  PART_NOT_FOUND: 'Peça não encontrada',
  PART_NUMBER_ALREADY_EXISTS: 'Número da peça já cadastrado no sistema',
  INSUFFICIENT_STOCK: 'Estoque insuficiente',
  PART_NOT_ACTIVE: 'Peça não está ativa',
  INSUFFICIENT_STOCK_FOR_PART: 'Estoque insuficiente para a peça',

  // Validação
  INVALID_DATA: 'Dados inválidos',
  INVALID_DATA_PROVIDED: 'Dados inválidos fornecidos',
  INVALID_STATUS_TRANSITION: 'Transição de status inválida',
  INVALID_LICENSE_PLATE_FORMAT:
    'Placa deve estar no formato ABC-1234 ou ABC1D23 (Mercosul)',
} as const;

export const SUCCESS_MESSAGES = {
  // Cliente
  CLIENT_CREATED: 'Cliente criado com sucesso',
  CLIENT_FOUND: 'Cliente encontrado com sucesso',
  CLIENT_UPDATED: 'Cliente atualizado com sucesso',
  CLIENT_DELETED: 'Cliente removido com sucesso',
  CLIENTS_LISTED: 'Lista de clientes retornada com sucesso',

  // Veículo
  VEHICLE_CREATED: 'Veículo criado com sucesso',
  VEHICLE_FOUND: 'Veículo encontrado com sucesso',
  VEHICLE_UPDATED: 'Veículo atualizado com sucesso',
  VEHICLE_DELETED: 'Veículo removido com sucesso',
  VEHICLES_LISTED: 'Veículos do cliente retornados com sucesso',

  // Serviço
  SERVICE_CREATED: 'Serviço criado com sucesso',
  SERVICE_FOUND: 'Serviço encontrado com sucesso',
  SERVICE_UPDATED: 'Serviço atualizado com sucesso',
  SERVICE_DELETED: 'Serviço removido com sucesso',
  SERVICES_LISTED: 'Serviços da categoria retornados com sucesso',

  // Ordem de Serviço
  SERVICE_ORDER_CREATED: 'Ordem de serviço criada com sucesso',
  SERVICE_ORDER_FOUND: 'Ordem de serviço encontrada',
  SERVICE_ORDER_STATUS_UPDATED: 'Status atualizado com sucesso',
  SERVICE_ORDER_APPROVED: 'Orçamento aprovado com sucesso',
  SERVICE_ORDER_HISTORY: 'Histórico de status retornado com sucesso',
  SERVICE_ORDERS_LISTED: 'Lista de ordens de serviço retornada com sucesso',
  CLIENT_SERVICE_ORDERS_LISTED:
    'Ordens de serviço do cliente retornadas com sucesso',
  VEHICLE_SERVICE_ORDERS_LISTED: 'Lista de ordens de serviço do veículo',

  // Autenticação
  LOGIN_SUCCESS: 'Login realizado com sucesso',
  USER_CREATED: 'Usuário criado com sucesso',
  USER_PROFILE: 'Perfil do usuário',
  USERS_LISTED: 'Lista de usuários',

  // Estatísticas
  SERVICE_EXECUTION_STATS: 'Estatísticas de execução dos serviços',
  GENERAL_SYSTEM_STATS: 'Estatísticas gerais do sistema',
  SPECIFIC_SERVICE_STATS: 'Estatísticas do serviço específico',
} as const;

export const NOTES_MESSAGES = {
  SERVICE_ORDER_CREATED: 'Ordem de serviço criada',
  BUDGET_APPROVED_EXECUTION_STARTED:
    'Orçamento aprovado pelo cliente - Iniciando execução',
} as const;

export const FIELD_DESCRIPTIONS = {
  // Cliente
  CLIENT_ID: 'ID do cliente',
  CLIENT_NAME: 'Nome do cliente',
  CLIENT_EMAIL: 'Email do cliente',
  CLIENT_PHONE: 'Telefone do cliente',
  CLIENT_ADDRESS: 'Endereço do cliente',
  CLIENT_TYPE: 'Tipo do cliente (INDIVIDUAL ou COMPANY)',
  CLIENT_DOCUMENT: 'CPF ou CNPJ do cliente',
  CLIENT_ADDITIONAL_INFO: 'Informações adicionais',
  CLIENT_CREATED_AT: 'Data de criação',
  CLIENT_UPDATED_AT: 'Data de atualização',
  CLIENT_VEHICLES: 'Veículos do cliente',

  // Usuário
  USER_USERNAME: 'Nome de usuário',
  USER_EMAIL: 'Email do usuário',
  USER_PASSWORD: 'Senha do usuário',
  USER_ROLE: 'Função do usuário no sistema',

  // Veículo
  VEHICLE_LICENSE_PLATE: 'Placa do veículo',

  // Serviços
  REQUESTED_SERVICES: 'Serviços solicitados',
  INCLUDED_SERVICES: 'Serviços incluídos na ordem',

  // Sistema
  SERVICE_ID: 'ID do serviço',
  CLIENT_CPF_CNPJ: 'CPF ou CNPJ do cliente',
  UNIQUE_SERVICE_ORDER_ID: 'ID único da ordem de serviço',
  UNIQUE_CLIENT_ID: 'ID único do cliente',
  ORDER_NUMBER: 'Número da ordem de serviço (ex: OS-2025-001)',
  CLIENT_DOCUMENT_SEARCH: 'CPF ou CNPJ do cliente',
} as const;

export const API_DESCRIPTIONS = {
  // Cliente
  CREATE_CLIENT: 'Cria um novo cliente no sistema com validação de CPF/CNPJ',
  LIST_CLIENTS: 'Retorna lista completa de clientes cadastrados',
  FIND_CLIENT_BY_DOCUMENT: 'Busca um cliente específico pelo CPF ou CNPJ',
  FIND_CLIENT_BY_ID: 'Retorna um cliente específico pelo seu ID',
  UPDATE_CLIENT: 'Atualiza dados de um cliente existente',
  DELETE_CLIENT: 'Remove um cliente do sistema',

  // Autenticação
  USER_LOGIN: 'Autentica um usuário e retorna um token JWT',
  CREATE_USER_ADMIN: 'Cria um novo usuário no sistema. Requer role ADMIN.',
  GET_USER_PROFILE: 'Retorna informações do usuário autenticado',
  LIST_USERS_ADMIN: 'Lista todos os usuários do sistema. Requer role ADMIN.',

  // Ordem de Serviço
  CREATE_SERVICE_ORDER:
    'Cria uma nova ordem de serviço com identificação do cliente, veículo, serviços e peças. Gera orçamento automaticamente.',
  LIST_SERVICE_ORDERS: 'Retorna todas as ordens de serviço do sistema',
  FIND_SERVICE_ORDER: 'Retorna os detalhes completos de uma ordem de serviço',
  UPDATE_SERVICE_ORDER_STATUS:
    'Atualiza o status da ordem de serviço seguindo o fluxo: RECEBIDA → EM_DIAGNOSTICO → AGUARDANDO_APROVACAO → EM_EXECUCAO → FINALIZADA → ENTREGUE',
  APPROVE_SERVICE_ORDER:
    'Aprova o orçamento e move a ordem de serviço para status EM_EXECUCAO',
  SERVICE_ORDER_STATUS_HISTORY:
    'Retorna o histórico completo de mudanças de status da ordem de serviço',
  FIND_SERVICE_ORDERS_BY_CLIENT:
    'Retorna todas as ordens de serviço de um cliente específico',

  // API Pública
  PUBLIC_FIND_BY_ORDER_NUMBER:
    'Permite que o cliente consulte o status de sua ordem de serviço usando o número da OS. Não requer autenticação.',
  PUBLIC_FIND_BY_DOCUMENT:
    'Permite que o cliente consulte todas as suas ordens de serviço usando CPF ou CNPJ. Não requer autenticação.',
  PUBLIC_FIND_BY_LICENSE_PLATE:
    'Permite consultar ordens de serviço usando a placa do veículo. Não requer autenticação.',

  // Estatísticas
  SERVICE_EXECUTION_STATS:
    'Retorna estatísticas de tempo de execução para cada serviço, incluindo tempo médio, precisão das estimativas e total de ordens concluídas.',
  GENERAL_SYSTEM_STATS:
    'Retorna estatísticas gerais incluindo total de ordens concluídas, tempo médio de execução e precisão geral das estimativas.',
  SPECIFIC_SERVICE_STATS:
    'Retorna estatísticas detalhadas de execução para um serviço específico.',

  // Health Check
  HEALTH_CHECK_API:
    'Endpoint para verificar se a API está funcionando corretamente',
} as const;

export const API_SUMMARY = {
  // Cliente
  CREATE_CLIENT: 'Criar novo cliente',
  LIST_CLIENTS: 'Listar todos os clientes',
  FIND_CLIENT_BY_DOCUMENT: 'Buscar cliente por CPF/CNPJ',
  FIND_CLIENT_BY_ID: 'Buscar cliente por ID',
  UPDATE_CLIENT: 'Atualizar cliente',
  DELETE_CLIENT: 'Remover cliente',

  // Veículo
  CREATE_VEHICLE: 'Criar novo veículo',
  FIND_VEHICLE_BY_ID: 'Buscar veículo por ID',
  FIND_VEHICLES_BY_CLIENT: 'Buscar veículos por cliente',
  FIND_VEHICLE_BY_LICENSE_PLATE: 'Buscar veículo por placa',
  UPDATE_VEHICLE: 'Atualizar veículo',
  DELETE_VEHICLE: 'Remover veículo',

  // Serviço
  CREATE_SERVICE: 'Criar novo serviço',
  FIND_SERVICE_BY_ID: 'Buscar serviço por ID',
  FIND_SERVICES_BY_CATEGORY: 'Buscar serviços por categoria',
  UPDATE_SERVICE: 'Atualizar serviço',
  DELETE_SERVICE: 'Remover serviço',

  // Ordem de Serviço
  CREATE_SERVICE_ORDER: 'Criar nova ordem de serviço',
  LIST_SERVICE_ORDERS: 'Listar todas as ordens de serviço',
  FIND_SERVICE_ORDER: 'Buscar ordem de serviço por ID',
  UPDATE_SERVICE_ORDER_STATUS: 'Atualizar status da ordem de serviço',
  APPROVE_SERVICE_ORDER: 'Aprovar orçamento da ordem de serviço',
  SERVICE_ORDER_STATUS_HISTORY: 'Histórico de status da ordem de serviço',
  FIND_SERVICE_ORDERS_BY_CLIENT: 'Buscar ordens de serviço por cliente',

  // Autenticação
  USER_LOGIN: 'Login do usuário',
  CREATE_USER: 'Criar usuário (Admin apenas)',
  GET_USER_PROFILE: 'Obter perfil do usuário',
  LIST_USERS: 'Listar usuários (Admin apenas)',

  // API Pública
  PUBLIC_FIND_BY_ORDER_NUMBER: 'Consultar OS por número (API Pública)',
  PUBLIC_FIND_BY_DOCUMENT: 'Consultar OS por CPF/CNPJ (API Pública)',
  PUBLIC_FIND_BY_LICENSE_PLATE:
    'Consultar OS por placa do veículo (API Pública)',

  // Estatísticas
  SERVICE_EXECUTION_STATS: 'Estatísticas de execução por serviço',
  GENERAL_SYSTEM_STATS: 'Estatísticas gerais do sistema',
  SPECIFIC_SERVICE_STATS: 'Estatísticas de um serviço específico',

  // Health Check
  HEALTH_CHECK_API: 'Verificar saúde da API',
} as const;

export const API_TAGS = {
  CUSTOMERS: 'Gestão de clientes (CPF/CNPJ)',
  VEHICLES: 'Gestão de veículos',
  SERVICES: 'Gestão de serviços',
  PARTS: 'Gestão de peças e insumos',
  SERVICE_ORDERS: 'Gestão de ordens de serviço',
  HEALTH_CHECK: 'Monitoramento da API',
  JWT_DESCRIPTION: 'Enter JWT token',
} as const;

export const HEALTH_CHECK_MESSAGES = {
  CONNECTION_REFUSED: 'Connection refused - service may be down',
  REQUEST_TIMEOUT: 'Request timeout after',
  NETWORK_ERROR: 'Network error',
  HTTP_ERROR: 'HTTP',
  HEALTH_STATUS_NOT_OK: 'Health status is not ok',
} as const;

export const HEALTH_CHECK_RESPONSES = {
  STATUS_OK: 'ok',
  API_WORKING: 'API funcionando corretamente',
  UPTIME_DESCRIPTION: 'Tempo de atividade em segundos',
  DEFAULT_VERSION: '1.0.0',
  DEFAULT_ENVIRONMENT: 'development',
} as const;

export const NOTIFICATION_MESSAGES = {
  FAILED_TO_SEND_STATUS_NOTIFICATION:
    'Falha ao enviar notificação de status para OS',
  FAILED_TO_SEND_BUDGET_NOTIFICATION:
    'Falha ao enviar notificação de orçamento',
  FAILED_TO_SEND_EMAIL: 'Falha ao enviar email',
  FAILED_TO_SEND_SMS: 'Falha ao enviar SMS',
} as const;
