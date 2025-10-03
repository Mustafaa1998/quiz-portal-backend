import { config } from "dotenv";
import { DataSource } from "typeorm";
import { User } from "./users/entities/user.entity";
import 'reflect-metadata';
import { Quiz } from "./quiz/entities/quiz.entity";
import { Question } from "./quiz/entities/question.entity";
import { Attempt } from "./quiz/entities/attempt.entity";
import { Answer } from "./quiz/entities/answer.entity";

const isProd = process.env.NODE_ENV === 'production';

config();

const AppDataSource = new DataSource({
    type: 'postgres',
  url: process.env.DATABASE_URL,               // <── same single string
  synchronize: false,
  logging: true,
  entities: [User, Quiz, Question, Attempt, Answer],
  migrations: ['src/migrations/*.ts'],
  ssl: isProd ? { rejectUnauthorized: false } : false,
});
export default AppDataSource;