import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AuthsService } from './auths.service';
import { RegisterAuthDto } from './dto/register-auth.dto';

@Controller('auths')
export class AuthsController {
  private readonly logger = new Logger(AuthsController.name);

  constructor(private readonly authsService: AuthsService) {}

  @Post('register')
  async register(@Body() registerAuthDto: RegisterAuthDto) {
    if (
      !registerAuthDto.username ||
      !registerAuthDto.email ||
      !registerAuthDto.password
    ) {
      throw new Error('Missing required fields: username, email, or password');
    }
    this.logger.log(`Registering user: ${registerAuthDto.username}`);
    return this.authsService.register(registerAuthDto);
  }
}
