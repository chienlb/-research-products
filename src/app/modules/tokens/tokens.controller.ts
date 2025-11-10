import { Controller, Post, Body, Logger } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { CreateTokenDto } from './dto/create-token.dto';

@Controller('tokens')
export class TokensController {
  private readonly logger = new Logger(TokensController.name);

  constructor(private readonly tokensService: TokensService) {}

  @Post()
  async create(@Body() createTokenDto: CreateTokenDto) {
    this.logger.log(`Creating token for user: ${createTokenDto.userId}`);
    return this.tokensService.createToken(createTokenDto);
  }
}
