import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Quiz } from "./quiz.entity";

@Entity('questions')
export class Question{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({length:500})
    text:string;
    
    @Column({type:'text',array:true})
    options:string[];

    @Column({type:'int'})
    correctOptionIndex:number;

    @CreateDateColumn()
    createdAt:Date;

    @ManyToOne(()=>Quiz, (quiz)=>quiz.questions,{onDelete:"CASCADE"})
    quiz:Quiz;
}