import { Controller, Post, Body, Logger } from '@nestjs/common';
import { HistoryInvitationsService } from './history-invitations.service';
import { CreateHistoryInvitationDto } from './dto/create-history-invitation.dto';

@Controller('history-invitations')
export class HistoryInvitationsController {
  private readonly logger = new Logger(HistoryInvitationsController.name);

  constructor(
    private readonly historyInvitationsService: HistoryInvitationsService,
  ) {}

  @Post()
  async create(@Body() createHistoryInvitationDto: CreateHistoryInvitationDto) {
    this.logger.log(
      `Creating history invitation for user: ${createHistoryInvitationDto.userId}`,
    );
    return this.historyInvitationsService.createHistoryInvitation(
      createHistoryInvitationDto,
    );
  }
}
