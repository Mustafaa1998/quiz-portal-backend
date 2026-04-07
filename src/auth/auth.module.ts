import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "src/users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { ConfigModule, ConfigService } from "@nestjs/config";



@Module({
    imports: [
        UsersModule,
        PassportModule,
        ConfigModule,
        JwtModule.registerAsync({
            imports:[ConfigModule],
            inject:[ConfigService],
            useFactory: (config: ConfigService) => ({
                secret:process.env.JWT_SECRET,
                signOptions:{expiresIn:process.env.JWT_EXPIRES || '1h'},
            }),
        }),
    ],
    controllers:[AuthController],
    providers:[AuthService,JwtStrategy],
    exports:[AuthService],
})
export class AuthModule{}