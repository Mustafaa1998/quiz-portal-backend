import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ILike, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    async findByEmail(email:string): Promise<User | null>{
        return this.usersRepository.findOne({where:{email}});
    }

    async findByEmailWithHash(email: string): Promise<(User & { passwordHash: string }) | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'name', 'role', 'createdAt', 'passwordHash'],
    });
    }

    async create(dto: CreateUserDto): Promise<Omit<User, 'passwordHash' >> {
        const existing =await this.findByEmail(dto.email);
        if(existing){
            throw new ConflictException('Email is already registered');
        }
        const passwordHash= await bcrypt.hash(dto.password,10);

        const user = this.usersRepository.create({
            email:dto.email,
            name:dto.name,
            role:dto.role,
            passwordHash,
        });
        const saved =await this.usersRepository.save(user);

        const {passwordHash: _, ...safe}=saved;
        return safe;
    }
    async findAllPaginated(
    page = 1,
    limit = 10,
    query?: string,
  ): Promise<{ items: User[]; total: number }> {
    const [items, total] = await this.usersRepository.findAndCount({
      where: query ? [{ email: ILike(`%${query}%`) }, { name: ILike(`%${query}%`) }] : {},
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { items, total };
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
