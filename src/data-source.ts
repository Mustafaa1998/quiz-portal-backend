import { config } from "dotenv";
import { DataSource } from "typeorm";
import { User } from "./users/entities/user.entity";
import 'reflect-metadata';
import { Quiz } from "./quiz/entities/quiz.entity";
import { Question } from "./quiz/entities/question.entity";
import { Attempt } from "./quiz/entities/attempt.entity";
import { Answer } from "./quiz/entities/answer.entity";


config();

const AppDataSource = new DataSource({
    type:'postgres',
    host:process.env.DB_HOST,
    port:Number(process.env.DB_PORT),
    username:process.env.DB_USERNAME,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
    synchronize:false,
    logging:true,
    entities:[User,Quiz,Question,Attempt,Answer],
    migrations: ['src/migrations/*.ts'],
});
export default AppDataSource;