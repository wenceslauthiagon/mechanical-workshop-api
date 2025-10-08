import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderStatus } from '../../../shared/enums';

@Entity('service_orders')
export class ServiceOrderEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'order_number', unique: true })
  orderNumber: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @Column({ name: 'vehicle_id' })
  vehicleId: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.RECEIVED,
  })
  status: OrderStatus;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb', default: '[]' })
  services: any[];

  @Column({ type: 'jsonb', default: '[]' })
  parts: any[];

  @Column({
    name: 'total_service_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalServicePrice: number;

  @Column({
    name: 'total_parts_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalPartsPrice: number;

  @Column({
    name: 'total_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalPrice: number;

  @Column({
    name: 'estimated_time_hours',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  estimatedTimeHours: number;

  @Column({ name: 'estimated_completion_date', type: 'timestamp' })
  estimatedCompletionDate: Date;

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt: Date | null;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
