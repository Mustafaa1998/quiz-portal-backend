import {Body,Controller,Delete,Get,Param,ParseIntPipe,Post,Put,Query,Req,UseGuards,} from '@nestjs/common';
import type { Request } from 'express';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/roles/roles.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { QuizService } from './quiz.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { UpdateQuizDto } from './dto/update-quiz.dto';

type AuthReq = Request & { user: { userId: number; email: string; role: Role } };

@Controller('quiz')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Public()
  @Get('popular')
  findPopular() {
    return this.quizService.findPopular();
  }

  @Get('all-with-plays')
  @Public()
  getAllWithPlays() {
    return this.quizService.getAllWithPlays();
  }

  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @Post('create')
  async create(@Body() dto: CreateQuizDto, @Req() req: AuthReq) {
    return this.quizService.create(dto.title, dto.description, req.user.userId);
  }
 
  @Get('all')
  @Public()
  async getAll() {
    return this.quizService.findAll();
  }

  @Get('me')
  myQuizzes(@Req() req: AuthReq) {
    return { message: `Quizzes for ${req.user.email}` };
  }

  @Roles(Role.INSTRUCTOR)
  @Post(':quizId/questions')
  addQuestion(
    @Param('quizId', ParseIntPipe) quizId: number,
    @Body() dto: CreateQuestionDto,
    @Req() req: AuthReq,
  ) {
    return this.quizService.addQuestion(quizId, dto, req.user.userId);
  }

  @Roles(Role.STUDENT, Role.INSTRUCTOR)
  @Get(':quizId/questions')
  getQuestions(@Param('quizId', ParseIntPipe) quizId: number) {
    return this.quizService.listQuestions(quizId);
  }

  @Roles(Role.STUDENT)
  @Post(':quizId/attempts')
  startAttempt(@Param('quizId', ParseIntPipe) quizId: number, @Req() req: AuthReq) {
    return this.quizService.startAttempt(quizId, req.user.userId);
  }

  @Roles(Role.STUDENT)
  @Post(':quizId/attempts/:attemptId/answers')
  async submitAnswer(
    @Param('quizId', ParseIntPipe) quizId: number,
    @Param('attemptId', ParseIntPipe) attemptId: number,
    @Body() dto: SubmitAnswerDto,
    @Req() req: AuthReq,
  ) {
    return this.quizService.submitAnswer(quizId, attemptId, dto, req.user.userId);
  }

  @Roles(Role.STUDENT)
  @Get('student/attempts')
  getMyAttempts(@Req() req: AuthReq) {
    return this.quizService.findAttemptsByStudent(req.user.userId);
  }


  @Roles(Role.STUDENT, Role.INSTRUCTOR)
  @Get(':quizId/attempts/:attemptId/result')
  getResult(
    @Param('quizId', ParseIntPipe) quizId: number,
    @Param('attemptId', ParseIntPipe) attemptId: number,
    @Req() req: AuthReq,
  ) {
    return this.quizService.getResult(quizId, attemptId, req.user.userId);
  }

  @Roles(Role.INSTRUCTOR)
  @Get(':quizId/attempts')
  listAttempts(
    @Param('quizId', ParseIntPipe) quizId: number,
    @Req() req: AuthReq,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const p = Math.max(parseInt(`${page}`, 10) || 1, 1);
    const l = Math.max(Math.min(parseInt(`${limit}`, 10) || 10, 50), 1);
    return this.quizService.listAttemptsForQuiz(quizId, req.user.userId, p, l);
  }

  @Roles(Role.INSTRUCTOR)
  @Get(':quizId/attempts/:attemptId/detail')
  attemptDetail(
    @Param('quizId', ParseIntPipe) quizId: number,
    @Param('attemptId', ParseIntPipe) attemptId: number,
    @Req() req: AuthReq,
  ) {
    return this.quizService.getStudentAttemptResult(quizId, attemptId, req.user.userId);
  }


  @Roles(Role.ADMIN)
  @Get('admin/summary')
  getAdminSummary() {
    return this.quizService.adminSummary();
  }

  @Roles(Role.ADMIN)
  @Get('admin/recent-quizzes')
  getRecentQuizzes() {
    return this.quizService.recentQuizzes();
  }

  @Roles(Role.ADMIN)
  @Get('admin/top-quizzes')
  getTopQuizzes() {
    return this.quizService.topQuizzes();
  }

  @Roles(Role.ADMIN)
  @Get('admin/attempts-per-day')
  getAttemptsPerDay(@Query('days') days = '14') {
    return this.quizService.attemptsPerDay(Number(days));
  }

  @Get()
@Roles(Role.ADMIN)
findAll(@Query('page') page: number, @Query('limit') limit: number, @Query('query') query?: string) {
  return this.quizService.findAllPaginated(page, limit, query);
}

@Put(':id')
@Roles(Role.ADMIN)
update(@Param('id') id: number, @Body() dto: UpdateQuizDto) {
  return this.quizService.update(id, dto);
}

@Delete(':id')
@Roles(Role.ADMIN)
remove(@Param('id') id: number) {
  return this.quizService.remove(id);
}

}
