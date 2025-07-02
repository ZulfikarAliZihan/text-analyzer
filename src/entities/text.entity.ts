import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from './user.entity';
@Entity('texts')
export class Text {
    @PrimaryGeneratedColumn('uuid')
    id: string = uuidv4();

    @Column({ type: 'text', nullable: false })
    content: string;

    @Column({ nullable: false })
    userId: string;

    @ManyToOne(() => User, (user) => user.id, {
        nullable: false,
        onUpdate: 'CASCADE',
    })
    @JoinColumn()
    user: User;

    @CreateDateColumn({ name: 'createdAt', type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updatedAt', type: 'timestamptz' })
    updatedAt!: Date;
}
