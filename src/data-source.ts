import { config } from "dotenv";
import { DataSource } from "typeorm";
import { User } from "./users/entities/user.entity";
import 'reflect-metadata';
import { Quiz } from "./quiz/entities/quiz.entity";
import { Question } from "./quiz/entities/question.entity";
import { Attempt } from "./quiz/entities/attempt.entity";
import { Answer } from "./quiz/entities/answer.entity";

config();

const isProd = process.env.NODE_ENV === "production";

const AppDataSource = new DataSource({
  type: 'postgres',

  url: isProd ? process.env.DATABASE_URL : undefined,

  host: !isProd ? process.env.DB_HOST : undefined,
  port: !isProd ? Number(process.env.DB_PORT) : undefined,
  username: !isProd ? process.env.DB_USERNAME : undefined,
  password: !isProd ? process.env.DB_PASSWORD : undefined,
  database: !isProd ? process.env.DB_NAME : undefined,

  synchronize: false,
  logging: true,

  entities: [User, Quiz, Question, Attempt, Answer],
  migrations: ['src/migrations/*.ts'],

  ssl: isProd ? { rejectUnauthorized: false } : false,
});

export default AppDataSource;
