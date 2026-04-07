import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAttemptsAndAnswers1759069667120 implements MigrationInterface {
    name = 'AddAttemptsAndAnswers1759069667120'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "answers" ("id" SERIAL NOT NULL, "selectedOptionIndex" integer NOT NULL, "isCorrect" boolean NOT NULL DEFAULT false, "attemptId" integer, "questionId" integer, CONSTRAINT "PK_9c32cec6c71e06da0254f2226c6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "attempts" ("id" SERIAL NOT NULL, "score" integer NOT NULL DEFAULT '0', "total" integer NOT NULL DEFAULT '0', "startedAt" TIMESTAMP NOT NULL DEFAULT now(), "quizId" integer, "studentId" integer, CONSTRAINT "PK_295ca261e361fd2fd217754dcac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "answers" ADD CONSTRAINT "FK_0becc7e6bc7085c84cf2e289ca0" FOREIGN KEY ("attemptId") REFERENCES "attempts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "answers" ADD CONSTRAINT "FK_c38697a57844f52584abdb878d7" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attempts" ADD CONSTRAINT "FK_f1246426f57a518bb0e93b50656" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attempts" ADD CONSTRAINT "FK_de4b968a8b6979ff4d4a6c38a51" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attempts" DROP CONSTRAINT "FK_de4b968a8b6979ff4d4a6c38a51"`);
        await queryRunner.query(`ALTER TABLE "attempts" DROP CONSTRAINT "FK_f1246426f57a518bb0e93b50656"`);
        await queryRunner.query(`ALTER TABLE "answers" DROP CONSTRAINT "FK_c38697a57844f52584abdb878d7"`);
        await queryRunner.query(`ALTER TABLE "answers" DROP CONSTRAINT "FK_0becc7e6bc7085c84cf2e289ca0"`);
        await queryRunner.query(`DROP TABLE "attempts"`);
        await queryRunner.query(`DROP TABLE "answers"`);
    }

}
