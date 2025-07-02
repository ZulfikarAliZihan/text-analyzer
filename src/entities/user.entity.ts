import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export const UNIQUE_USERS_USERNAME = 'username';
export const UNIQUE_USERS_EMAIL = 'email';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4();

  @Column({ length: 100 })
  name: string;

  @Column()
  password: string;

  @Unique(UNIQUE_USERS_USERNAME, ['username'])
  @Column({ length: 200 })
  username: string;

  @Unique(UNIQUE_USERS_EMAIL, ['email'])
  @Column({ length: 200 })
  email: string;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamptz' })
  updatedAt!: Date;
}
