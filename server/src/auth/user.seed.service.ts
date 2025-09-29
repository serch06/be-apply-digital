// src/users/user.seed.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { hashPassword } from './utils/bcrypt';

@Injectable()
export class UserSeedService implements OnModuleInit {
  private readonly logger = new Logger(UserSeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    const existing = await this.userRepo.findOne({
      where: { email: 'admin@email.com' },
    });

    if (!existing) {
      const hashedPassword = await hashPassword('admin123');

      const user = this.userRepo.create({
        email: 'admin@email.com',
        password: hashedPassword,
      });

      await this.userRepo.save(user);
      this.logger.log('✅ Seed user created: admin@email.com / admin123');
    }
  }
}
