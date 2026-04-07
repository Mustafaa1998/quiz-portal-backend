import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { Role } from "src/auth/roles/roles.enum";


export class CreateUserDto{

@IsEmail()
email: string;

@IsString()
@IsNotEmpty()
name: string;

@IsString()
@MinLength(6,{message:'Password Must Be Atleast 6 Characters'})
@MaxLength(20)
password: string;

@IsEnum(Role,{message:'Role Must Be STUDENT Or INSTRUCTOR'})
role: Role;
}