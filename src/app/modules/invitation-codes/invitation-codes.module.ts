import { Module } from '@nestjs/common';
import { InvitationCodesService } from './invitation-codes.service';
import { InvitationCodesController } from './invitation-codes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  InvitationCode,
  InvitationCodeSchema,
} from './schema/invitation-code.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InvitationCode.name, schema: InvitationCodeSchema },
    ]),
    UsersModule,
  ],
  controllers: [InvitationCodesController],
  providers: [InvitationCodesService],
  exports: [InvitationCodesService],
})
export class InvitationCodesModule {}
