// src/auth/user.seed.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { hashPassword } from '../utils/bcrypt';

@Injectable()
export class UserSeedService implements OnModuleInit {
  private readonly logger = new Logger(UserSeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    const exist = await this.userRepo.findOne({
      where: { email: 'admin@email.com' },
    });

    if (!exist) {
      const user = this.userRepo.create({
        email: 'admin@email.com',
        password: await hashPassword('admin123'),
      });
      await this.userRepo.save(user);
      this.logger.log('Admin user created');
    } else {
      this.logger.log('Admin user already exists');
    }
  }
}
