import { IsInt, Min } from "class-validator";

export class StartAttemptDto {
    @IsInt()
    @Min(1)
    quizId:number;
}
