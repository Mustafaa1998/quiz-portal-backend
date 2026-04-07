import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Role } from '../../auth/roles/roles.enum';
import { Quiz } from '../../quiz/entities/quiz.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({select:false})
  passwordHash: string;

  @Column({ type: 'varchar', length: 20, default: Role.STUDENT })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Quiz, (quiz) => quiz.createdBy)
  quizzes: Quiz[];
}
