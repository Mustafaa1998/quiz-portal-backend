import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Attempt } from "./attempt.entity";
import { Question } from "./question.entity";

@Entity('answers')
export class Answer {

    @PrimaryGeneratedColumn()
    id:number;

    @ManyToOne(()=>Attempt,(attenpt)=>attenpt.answers,{onDelete:'CASCADE'})
    attempt:Attempt;

    @ManyToOne(()=>Question,{eager:true, onDelete:'CASCADE'})
    question:Question;

    @Column({type:'int'})
    selectedOptionIndex:number;

    @Column({type:'boolean',default:false})
    isCorrect:boolean;
}
