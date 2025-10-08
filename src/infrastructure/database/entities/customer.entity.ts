import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CustomerType } from '../../../shared/enums';

@Entity('customers')
export class CustomerEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  document: string;

  @Column({
    type: 'enum',
    enum: CustomerType,
  })
  type: CustomerType;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ type: 'text' })
  address: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
