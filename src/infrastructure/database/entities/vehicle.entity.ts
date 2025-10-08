import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CustomerEntity } from './customer.entity';

@Entity('vehicles')
export class VehicleEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'license_plate', unique: true })
  licensePlate: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column()
  color: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => CustomerEntity)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;
}
