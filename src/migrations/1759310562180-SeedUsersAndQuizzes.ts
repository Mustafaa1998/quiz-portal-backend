import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from "bcrypt";

type SeedUser = {
  name: string;
  email: string;
  role: "ADMIN" | "INSTRUCTOR" | "STUDENT";
};

export class SeedUsersAndQuizzes1759310562180 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Users
    const passwordHash = await bcrypt.hash("Passw0rd!", 10);

    const users: SeedUser[] = [
      { name: "Site Admin", email: "admin@quizportal.dev", role: "ADMIN" },
      { name: "Dr. Ayesha Khan", email: "ayesha.khan@quizportal.dev", role: "INSTRUCTOR" },
      { name: "Prof. Omar Siddiqui", email: "omar.siddiqui@quizportal.dev", role: "INSTRUCTOR" },
      { name: "Ms. Sara Ahmed", email: "sara.ahmed@quizportal.dev", role: "INSTRUCTOR" },

      { name: "Ali Raza", email: "ali.raza@student.dev", role: "STUDENT" },
      { name: "Hamna Punjwani", email: "hamna.punjwani@student.dev", role: "STUDENT" },
      { name: "Fatima Noor", email: "fatima.noor@student.dev", role: "STUDENT" },
      { name: "Hassan Iqbal", email: "hassan.iqbal@student.dev", role: "STUDENT" },
      { name: "Aiman Zafar", email: "aiman.zafar@student.dev", role: "STUDENT" },
    ];

    for (const u of users) {
      await queryRunner.query(
        `INSERT INTO "user" ("name","email","role","passwordHash","createdAt")
         VALUES ($1,$2,$3,$4,NOW())
         ON CONFLICT ("email") DO NOTHING`,
        [u.name, u.email, u.role, passwordHash]
      );
    }

    // 2) Instructor IDs
    const rows: Array<{ id: number; email: string }> = await queryRunner.query(
      `SELECT id, email FROM "user" WHERE email IN ($1,$2,$3)`,
      ["ayesha.khan@quizportal.dev", "omar.siddiqui@quizportal.dev", "sara.ahmed@quizportal.dev"]
    );
    const idByEmail = Object.fromEntries(rows.map(r => [r.email, r.id]));

    const ayeshaId = idByEmail["ayesha.khan@quizportal.dev"];
    const omarId   = idByEmail["omar.siddiqui@quizportal.dev"];
    const saraId   = idByEmail["sara.ahmed@quizportal.dev"];

    // 3) Quizzes (NO questions)
    const quizzes = [
      { title: "Cardiac Physiology Basics", description: "Foundations of cardiac cycle, ECG, preload/afterload, and hemodynamics.", createdById: ayeshaId },
      { title: "Endocrine Essentials",       description: "Hormones, feedback loops, and common endocrine disorders.",           createdById: ayeshaId },

      { title: "Data Structures in TypeScript", description: "Arrays, maps, sets, stacks/queues with time complexity drills.", createdById: omarId },
      { title: "NestJS Fundamentals",           description: "Providers, modules, controllers, DTOs, pipes, and guards.",      createdById: omarId },

      { title: "Research Methods 101",     description: "Study designs, sampling, bias/confounding, and validity.", createdById: saraId },
      { title: "Biostatistics Quick Check", description: "p-values, CI, t-test vs chi-square, regression basics.",  createdById: saraId },
      { title: "Front-End React Quiz",      description: "Hooks, state, effects, routing, and component patterns.", createdById: saraId },
    ];

    for (const q of quizzes) {
      await queryRunner.query(
        `INSERT INTO "quizzes" ("title","description","createdAt","createdById")
         VALUES ($1,$2,NOW(),$3)
         ON CONFLICT DO NOTHING`,
        [q.title, q.description, q.createdById]
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete quizzes first (FK-safe)
    await queryRunner.query(
      `DELETE FROM "quizzes" WHERE "title" IN (
        'Cardiac Physiology Basics',
        'Endocrine Essentials',
        'Data Structures in TypeScript',
        'NestJS Fundamentals',
        'Research Methods 101',
        'Biostatistics Quick Check',
        'Front-End React Quiz'
      )`
    );

    // Delete seeded users
    await queryRunner.query(
      `DELETE FROM "user" WHERE "email" IN (
        'admin@quizportal.dev',
        'ayesha.khan@quizportal.dev',
        'omar.siddiqui@quizportal.dev',
        'sara.ahmed@quizportal.dev',
        'ali.raza@student.dev',
        'hamna.punjwani@student.dev',
        'fatima.noor@student.dev',
        'hassan.iqbal@student.dev',
        'aiman.zafar@student.dev'
      )`
    );
  }
}
