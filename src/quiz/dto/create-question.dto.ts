import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsString, MaxLength, Min } from "class-validator";

export class CreateQuestionDto{
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    text:string;

    @IsArray()
    @ArrayMinSize(2)
    @IsString({each:true})
    options:string[];

    @IsInt()
    @Min(0)
    correctOptionIndex:number
}