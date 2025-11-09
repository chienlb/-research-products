import { Controller, Post, Body, Logger } from '@nestjs/common';
import { InvitationCodesService } from './invitation-codes.service';
import { CreateInvitationCodeDto } from './dto/create-invitation-code.dto';

@Controller('invitation-codes')
export class InvitationCodesController {
  private readonly logger = new Logger(InvitationCodesController.name);

  constructor(
    private readonly invitationCodesService: InvitationCodesService,
  ) {}

  @Post()
  async create(@Body() createInvitationCodeDto: CreateInvitationCodeDto) {
    this.logger.log(
      `Creating invitation code by user: ${createInvitationCodeDto.createdBy}`,
    );
    return this.invitationCodesService.createInvitationCode(
      createInvitationCodeDto,
    );
  }
}
