import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateQuizDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title:string;

    @IsString()
    @IsOptional()
    description?:string;
}
