import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { User } from 'src/users/entities/user.entity';
import { Question } from './entities/question.entity';
import { Attempt } from './entities/attempt.entity';
import { Answer } from './entities/answer.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz) private readonly quizRepository: Repository<Quiz>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Question) private readonly questionRepository: Repository<Question>,
    @InjectRepository(Attempt) private readonly attemptRepository: Repository<Attempt>,
    @InjectRepository(Answer) private readonly answerRepository: Repository<Answer>,
  ) {}

  async create(title: string, description: string | undefined, creatorUserId: number) {
    const instructor = await this.userRepository.findOne({ where: { id: creatorUserId } });
    if (!instructor) throw new NotFoundException('Instructor not found');

    const quiz = this.quizRepository.create({
      title,
      description: description ?? undefined,
      createdBy: instructor,
    });
    return this.quizRepository.save(quiz);
  }

  async findAll() {
    return this.quizRepository.find();
  }

  async addQuestion(quizId: number, dto: CreateQuestionDto, ownerId: number) {
    const quiz = await this.quizRepository.findOne({
      where: { id: quizId },
      relations: ['createdBy'],
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (quiz.createdBy.id !== ownerId) throw new ForbiddenException('You are not the owner of this quiz');

    if (dto.correctOptionIndex < 0 || dto.correctOptionIndex >= dto.options.length) {
      throw new BadRequestException('correctOptionIndex is out of bounds for options');
    }

    const q = this.questionRepository.create({
      text: dto.text,
      options: dto.options,
      correctOptionIndex: dto.correctOptionIndex,
      quiz,
    });
    return this.questionRepository.save(q);
  }

  async listQuestions(quizId: number) {
    return this.questionRepository.find({
      where: { quiz: { id: quizId } },
      order: { createdAt: 'ASC' },
    });
  }

  async startAttempt(quizId: number, studentId: number) {
    const quiz = await this.quizRepository.findOne({ where: { id: quizId } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    const total = await this.questionRepository.count({ where: { quiz: { id: quizId } } });
    if (total === 0) throw new BadRequestException('Quiz has no questions');

    const student = await this.userRepository.findOne({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');

    const existing = await this.attemptRepository.findOne({
      where: { quiz: { id: quizId }, student: { id: studentId } },
    });
    if (existing) return existing;

    const attempt = this.attemptRepository.create({ quiz, student, total, score: 0 });
    return this.attemptRepository.save(attempt);
  }

  async submitAnswer(quizId: number, attemptId: number, dto: SubmitAnswerDto, studentId: number) {
    const attempt = await this.attemptRepository.findOne({
      where: { id: attemptId },
      relations: ['student', 'quiz'],
    });
    if (!attempt || attempt.quiz.id !== quizId) throw new NotFoundException('Attempt not found');
    if (attempt.student.id !== studentId) throw new ForbiddenException('Not your attempt');

    const question = await this.questionRepository.findOne({
      where: { id: dto.questionId, quiz: { id: quizId } },
    });
    if (!question) throw new NotFoundException('Question not found');

    const { selectedOptionIndex } = dto;
    if (selectedOptionIndex < 0 || selectedOptionIndex >= question.options.length) {
      throw new BadRequestException('selectedOptionIndex out of bounds');
    }

    const isCorrect = selectedOptionIndex === question.correctOptionIndex;

    const existing = await this.answerRepository.findOne({
      where: { attempt: { id: attemptId }, question: { id: dto.questionId } },
    });
    if (existing) {
      const wasCorrect = existing.isCorrect;
      existing.selectedOptionIndex = selectedOptionIndex;
      existing.isCorrect = isCorrect;

      if (wasCorrect !== isCorrect) {
        await this.attemptRepository.update(
          { id: attemptId },
          { score: () => (isCorrect ? `"score" + 1` : `"score" - 1`) as any },
        );
      }
      return this.answerRepository.save(existing);
    }

    const ans = this.answerRepository.create({
      attempt,
      question,
      selectedOptionIndex,
      isCorrect,
    });
    await this.answerRepository.save(ans);

    if (isCorrect) {
      await this.attemptRepository.update({ id: attemptId }, { score: () => `"score" + 1` as any });
    }
    return ans;
  }

  async getResult(quizId: number, attemptId: number, requesterId: number) {
    const attempt = await this.attemptRepository.findOne({
      where: { id: attemptId, quiz: { id: quizId } },
      relations: { quiz: { createdBy: true }, student: true },
    });
    if (!attempt) throw new NotFoundException('Attempt not found');

    const isOwner = attempt.quiz.createdBy.id === requesterId;
    const isSelf = attempt.student.id === requesterId;
    if (!isOwner && !isSelf) throw new ForbiddenException('Not allowed');

    const answers = await this.answerRepository.find({
      where: { attempt: { id: attemptId } },
      relations: ['question'],
      order: { id: 'ASC' },
    });

    return {
      attemptId: attempt.id,
      quizId,
      studentId: attempt.student.id,
      score: attempt.score,
      total: attempt.total,
      answers: answers.map((a) => ({
        questionId: a.question.id,
        selectedOptionIndex: a.selectedOptionIndex,
        isCorrect: a.isCorrect,
      })),
      startedAt: attempt.startedAt,
    };
  }

  async listAttemptsForQuiz(quizId: number, ownerId: number, page = 1, limit = 10) {
    const quiz = await this.quizRepository.findOne({
      where: { id: quizId },
      relations: ['createdBy'],
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (quiz.createdBy.id !== ownerId) throw new ForbiddenException('Not your quiz');

    const [rows, total] = await this.attemptRepository.findAndCount({
      where: { quiz: { id: quizId } },
      relations: ['student'],
      order: { startedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStudentAttemptResult(quizId: number, attemptId: number, ownerId: number) {
    const attempt = await this.attemptRepository.findOne({
      where: { id: attemptId, quiz: { id: quizId } },
      relations: {
        quiz: { createdBy: true },
        student: true,
        answers: { question: true },
      },
    });
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.quiz.createdBy.id !== ownerId) throw new ForbiddenException('Not your quiz');

    return attempt;
  }

  async findAttemptsByStudent(studentId: number) {
    return this.attemptRepository.find({
      where: { student: { id: studentId } },
      relations: ['quiz'],
      order: { startedAt: 'DESC' },
    });
  }

  async adminSummary() {
    const [users, quizzes, attempts] = await Promise.all([
      this.userRepository.count(),
      this.quizRepository.count(),
      this.attemptRepository.count(),
    ]);
    return { users, quizzes, attempts };
  }

  async recentQuizzes(limit = 5) {
    const rows = await this.quizRepository
      .createQueryBuilder('q')
      .leftJoin(Attempt, 'a', 'a.quizId = q.id')
      .select('q.id', 'id')
      .addSelect('q.title', 'title')
      .addSelect('q.createdAt', 'createdAt')
      .addSelect('COUNT(a.id)', 'attemptsCount')
      .groupBy('q.id')
      .orderBy('q.createdAt', 'DESC')
      .limit(limit)
      .getRawMany<{
        id: number;
        title: string;
        createdAt: string;
        attemptsCount: string;
      }>();

    return rows.map(r => ({
      id: r.id,
      title: r.title,
      createdAt: r.createdAt,
      attemptsCount: Number(r.attemptsCount ?? 0),
    }));
  }

  async topQuizzes(limit = 5) {
    const rows = await this.attemptRepository
      .createQueryBuilder('a')
      .innerJoin('a.quiz', 'q')
      .select('q.id', 'id')
      .addSelect('q.title', 'title')
      .addSelect('COUNT(a.id)', 'attemptsCount')
      .groupBy('q.id')
      .orderBy('COUNT(a.id)', 'DESC')
      .limit(limit)
      .getRawMany<{ id: number; title: string; attemptsCount: string }>();

  return rows.map(r => ({
    id: r.id,
    title: r.title,
    attemptsCount: Number(r.attemptsCount ?? 0),
  }));
}

  async attemptsPerDay(days = 14) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));

    const raw = await this.attemptRepository
      .createQueryBuilder('a')
      .select("TO_CHAR(DATE(a.startedAt), 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)', 'attempts')
      .where('a.startedAt >= :start::timestamp', { start })
      .groupBy("DATE(a.startedAt)")
      .orderBy('date', 'ASC')
      .getRawMany<{ date: string; attempts: string }>();

    const map = new Map<string, number>();
    for (const r of raw) map.set(r.date, Number(r.attempts));

    const out: { date: string; attempts: number }[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start.getTime());
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      out.push({ date: key, attempts: map.get(key) ?? 0 });
    }
    return out;
  }

  async findPopular() {
    return this.quizRepository
      .createQueryBuilder('quiz')
      .leftJoin(Attempt, 'a', 'a.quizId = quiz.id')
      .select('quiz.id', 'id')
      .addSelect('quiz.title', 'title')
      .addSelect('quiz.description', 'description')
      .addSelect("COALESCE(COUNT(a.id), 0)", 'plays')
      .groupBy('quiz.id')
      .orderBy('plays', 'DESC')
      .limit(6)
      .getRawMany();
  }  

  async getAllWithPlays() {
    return this.quizRepository
      .createQueryBuilder('quiz')
      .leftJoin(Attempt, 'a', 'a.quizId = quiz.id')
      .select('quiz.id', 'id')
      .addSelect('quiz.title', 'title')
      .addSelect('quiz.description', 'description')
      .addSelect("COALESCE(COUNT(a.id), 0)", 'plays')
      .groupBy('quiz.id')
      .orderBy('quiz.createdAt', 'DESC')
      .getRawMany();
  }
  async findAllPaginated(
    page = 1,
    limit = 10,
    query?: string,
  ): Promise<{ items: Quiz[]; total: number }> {
    const [items, total] = await this.quizRepository.findAndCount({
      where: query ? [{ title: ILike(`%${query}%`) }] : {},
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { items, total };
  }

  async update(id: number, dto: UpdateQuizDto): Promise<Quiz> {
    await this.quizRepository.update(id, dto);
    const quiz = await this.quizRepository.findOne({ where: { id } });
    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  async remove(id: number): Promise<void> {
    await this.quizRepository.delete(id);
  }
}
