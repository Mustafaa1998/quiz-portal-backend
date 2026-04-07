import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Question } from "./question.entity";

@Entity('quizzes')
export class Quiz{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({type:'varchar',length:200})
    title:string|null;

    @Column({type:'text',nullable:true})
    description:string;

    @ManyToOne(()=> User, (user)=>user.quizzes,{eager:true,onDelete:'CASCADE'})
    createdBy:User;

    @OneToMany(()=>Question,(q)=>q.quiz,{cascade:false})
    questions:Question[];

    @CreateDateColumn()
    createdAt:Date;
    
}