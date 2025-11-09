import { Module } from '@nestjs/common';
import { HistoryInvitationsService } from './history-invitations.service';
import { HistoryInvitationsController } from './history-invitations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  HistoryInvitation,
  HistoryInvitationSchema,
} from './schema/history-invitation.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HistoryInvitation.name, schema: HistoryInvitationSchema },
    ]),
    UsersModule,
  ],
  controllers: [HistoryInvitationsController],
  providers: [HistoryInvitationsService],
  exports: [HistoryInvitationsService, MongooseModule],
})
export class HistoryInvitationsModule {}
