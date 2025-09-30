import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './public.decorator';

@ApiTags('Authorization')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'This endpoint is intended in case it is necessary to test with another users',
  })
  register(@Body() dto: RegisterDto) {
    this.logger.log(`Register user called`);
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    this.logger.log(`Login user called`);
    return this.authService.login(dto);
  }
}
