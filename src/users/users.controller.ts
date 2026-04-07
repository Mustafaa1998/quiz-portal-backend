import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Public } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/roles/roles.enum';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService){}

    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    register(@Body() dto:CreateUserDto){
        return this.usersService.create(dto);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    me(@Req() req:any){
        return req.user;
    }

    @Get()
    @Roles(Role.ADMIN)
    findAll(@Query('page') page: number, @Query('limit') limit: number, @Query('query') query?: string) {
    return this.usersService.findAllPaginated(page, limit, query);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id') id: number) {
    return this.usersService.remove(id);
    }
}
