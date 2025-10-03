import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entity';
import { QuizController } from './quiz.controller';
import { User } from 'src/users/entities/user.entity';
import { Question } from './entities/question.entity';
import { Attempt } from './entities/attempt.entity';
import { Answer } from './entities/answer.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Quiz,Question,Attempt,Answer,User])],
  controllers:[QuizController],
  providers: [QuizService],
  exports:[QuizService],
})
export class QuizModule {}
