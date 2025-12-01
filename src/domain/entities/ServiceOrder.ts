export type OrderStatus =
  | 'RECEBIDA'
  | 'DIAGNOSTICO'
  | 'AGUARDANDO_APROVACAO'
  | 'EXECUCAO'
  | 'FINALIZADA'
  | 'ENTREGUE';

export interface ServiceOrder {
  id: string;
  clientName: string;
  clientContact: string;
  vehicle: any;
  services: any;
  parts: any;
  status: OrderStatus;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
