// Constantes para Mechanic
export const MECHANIC_CONSTANTS = {
  VALIDATION: {
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 100,
    MIN_EXPERIENCE_YEARS: 0,
    MAX_EXPERIENCE_YEARS: 50,
  },
  MESSAGES: {
    NOT_FOUND: 'Mecânico não encontrado',
    EMAIL_ALREADY_EXISTS: 'Email já está em uso por outro mecânico',
    CREATED_SUCCESS: 'Mecânico criado com sucesso',
    UPDATED_SUCCESS: 'Mecânico atualizado com sucesso',
    DELETED_SUCCESS: 'Mecânico desativado com sucesso',
    AVAILABILITY_TOGGLED: 'Disponibilidade do mecânico alterada com sucesso',
    NOT_AVAILABLE: 'Mecânico não está disponível para novos serviços',
    ERROR_FIND_AVAILABLE: 'Erro ao buscar mecânicos disponíveis',
    ERROR_FIND_BY_SPECIALTY: 'Erro ao buscar mecânicos por especialidade',
    ERROR_UPDATE: 'Erro ao atualizar mecânico',
    ERROR_TOGGLE_AVAILABILITY: 'Erro ao alterar disponibilidade do mecânico',
    ERROR_DELETE: 'Erro ao excluir mecânico',
    ERROR_GET_WORKLOAD: 'Erro ao buscar carga de trabalho do mecânico',
    ERROR_ASSIGN_TO_ORDER: 'Erro ao atribuir mecânico à ordem de serviço',
    ERROR_FIND_BEST: 'Erro ao buscar melhor mecânico para o serviço',
  },
  DEFAULT_VALUES: {
    EXPERIENCE_YEARS: 0,
    IS_ACTIVE: true,
    IS_AVAILABLE: true,
    ACTIVE_ORDERS: 0,
    COMPLETED_ORDERS: 0,
    AVERAGE_COMPLETION_TIME: 0,
  },
  QUERY: {
    RECENT_COMPLETED_ORDERS_LIMIT: 10,
    ACTIVE_STATUS_LIST: [
      'EM_DIAGNOSTICO',
      'AGUARDANDO_APROVACAO',
      'EM_EXECUCAO',
    ] as const,
    COMPLETED_STATUS: 'ENTREGUE' as const,
  },
  ERROR_CODES: {
    MECHANIC_NOT_FOUND: 'MECHANIC_NOT_FOUND',
    MECHANIC_EMAIL_ALREADY_EXISTS: 'MECHANIC_EMAIL_ALREADY_EXISTS',
    MECHANIC_NOT_AVAILABLE: 'MECHANIC_NOT_AVAILABLE',
    UPDATE_MECHANIC_ERROR: 'UPDATE_MECHANIC_ERROR',
    TOGGLE_MECHANIC_AVAILABILITY_ERROR: 'TOGGLE_MECHANIC_AVAILABILITY_ERROR',
    DELETE_MECHANIC_ERROR: 'DELETE_MECHANIC_ERROR',
    GET_MECHANIC_WORKLOAD_ERROR: 'GET_MECHANIC_WORKLOAD_ERROR',
    ASSIGN_MECHANIC_ERROR: 'ASSIGN_MECHANIC_ERROR',
    FIND_BEST_MECHANIC_ERROR: 'FIND_BEST_MECHANIC_ERROR',
  },
} as const;

// Constantes para ServiceOrder
export const SERVICE_ORDER_CONSTANTS = {
  MESSAGES: {
    MECHANIC_ASSIGNED: 'Mecânico atribuído à ordem de serviço com sucesso',
    MECHANIC_REMOVED: 'Mecânico removido da ordem de serviço',
    INVALID_ASSIGNMENT: 'Não é possível atribuir mecânico indisponível',
  },
} as const;

// Especialidades disponíveis para mecânicos
export const MECHANIC_SPECIALTIES = {
  MOTOR: 'Motor',
  FREIOS: 'Freios',
  SUSPENSAO: 'Suspensão',
  ELETRICA: 'Elétrica',
  AR_CONDICIONADO: 'Ar Condicionado',
  TRANSMISSAO: 'Transmissão',
  ESCAPAMENTO: 'Escapamento',
  PNEUS: 'Pneus e Rodas',
  CARROCERIA: 'Carroceria',
  PINTURA: 'Pintura',
} as const;

export const SPECIALTY_LIST = Object.values(MECHANIC_SPECIALTIES);
