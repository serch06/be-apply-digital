import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { RegisterDto } from '../dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dto/login.dto';
import { JwtPayload } from '../jwt.strategy';
import { comparePassword, hashPassword } from '../utils/bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ id: string; email: string }> {
    const hash: string = await hashPassword(dto.password);
    const user: User = this.userRepo.create({
      email: dto.email,
      password: hash,
    });
    await this.userRepo.save(user);

    this.logger.log(`User registered: ${dto.email}`);
    return { id: user.id, email: user.email };
  }

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const user: User | null = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid: boolean = await comparePassword(dto.password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const payload: JwtPayload = { sub: user.id, email: user.email };
    const token: string = await this.jwtService.signAsync(payload);

    this.logger.log(`User logged in: ${dto.email}`);
    return { access_token: token };
  }
}
