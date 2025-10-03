import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "src/users/users.service";
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService{
    constructor(
        private readonly userService: UsersService,
        private readonly jwt: JwtService,
    ){}

    async validateUser(email: string, password:string){
    const user = await this.userService.findByEmailWithHash(email);
    if(!user) throw new UnauthorizedException('Invalid Credential');

    const ok=await bcrypt.compare(password, user.passwordHash);
    if(!ok) throw new UnauthorizedException('Invalid Credential');

    const {passwordHash: _, ...safe} =user;
    return safe;
    }

    async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
        access_token: await this.jwt.signAsync(payload),
        user
    };
    }

}