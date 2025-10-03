import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { QuizModule } from './quiz/quiz.module';
import { Quiz } from './quiz/entities/quiz.entity';
import { Question } from './quiz/entities/question.entity';
import { Attempt } from './quiz/entities/attempt.entity';
import { Answer } from './quiz/entities/answer.entity';

const isProd = process.env.NODE_ENV === 'production';

@Module({
  imports: [
  ConfigModule.forRoot({isGlobal:true}),

  TypeOrmModule.forRoot({
    type: 'postgres',
    url: process.env.DATABASE_URL,            // <── single connection string
    autoLoadEntities: true,
    synchronize: false,                        // we use migrations
    ssl: isProd ? { rejectUnauthorized: false } : false,
  }),
  UsersModule,
  AuthModule,
  QuizModule,
  ],
  providers: [
    {provide:APP_GUARD, useClass:JwtAuthGuard},
    {provide:APP_GUARD, useClass:RolesGuard},
  ],
})
export class AppModule {}
