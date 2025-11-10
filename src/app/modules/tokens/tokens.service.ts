import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTokenDto } from './dto/create-token.dto';
import { Token, TokenDocument } from './schema/token.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class TokensService {
  constructor(
    @InjectModel(Token.name)
    private readonly tokenModel: Model<TokenDocument>,
    private readonly userService: UsersService,
  ) {}

  async createToken(createTokenDto: CreateTokenDto) {
    const user = await this.userService.findUserById(createTokenDto.userId);
    if (!user) {
      throw new NotFoundException('User does not exist.');
    }
    const newToken = new this.tokenModel({
      ...createTokenDto,
    });

    try {
      return await newToken.save();
    } catch (error: unknown) {
      throw new Error(
        'Failed to create token: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      );
    }
  }
}
