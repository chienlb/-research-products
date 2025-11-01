import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './app/modules/users/users.module';
import { TokensModule } from './app/modules/tokens/tokens.module';

@Module({
  imports: [UsersModule, TokensModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
