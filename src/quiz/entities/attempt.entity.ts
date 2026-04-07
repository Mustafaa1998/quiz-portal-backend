import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Quiz } from "./quiz.entity";
import { User } from "src/users/entities/user.entity";
import { Answer } from "./answer.entity";

@Entity('attempts')
export class Attempt {

    @PrimaryGeneratedColumn()
    id:number;

    @ManyToOne(()=>Quiz,{onDelete:'CASCADE'})
    quiz:Quiz;
    
    @ManyToOne(()=>User,{onDelete:'CASCADE'})
    student:User;

    @Column({default:0})
    score:number;

    @Column({default:0})
    total:number;

    @CreateDateColumn()
    startedAt:Date;

    @OneToMany(()=>Answer,(a)=>a.attempt)
    answers:Answer[];
}
