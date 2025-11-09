import { Injectable } from '@nestjs/common';
import { CreateHistoryInvitationDto } from './dto/create-history-invitation.dto';
import { UpdateHistoryInvitationDto } from './dto/update-history-invitation.dto';
import {
  HistoryInvitation,
  HistoryInvitationDocument,
} from './schema/history-invitation.schema';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class HistoryInvitationsService {
  constructor(
    @InjectModel(HistoryInvitation.name)
    private readonly historyModel: Model<HistoryInvitationDocument>,
    private readonly userService: UsersService,
  ) {}

  async createHistoryInvitation(
    createHistoryInvitationDto: CreateHistoryInvitationDto,
  ) {
    const userId = await this.userService.findUserById(
      createHistoryInvitationDto.userId,
    );
    if (!userId) {
      throw new Error('User not found');
    }
    const historyInvitation = new this.historyModel({
      ...createHistoryInvitationDto,
      user: userId,
    });
    return await historyInvitation.save();
  }

  async findAllHistoryInvitations() {
    return await this.historyModel.find().exec();
  }

  async findOneHistoryInvitation(id: string) {
    return await this.historyModel.findById(id).exec();
  }

  async updateHistoryInvitation(
    id: string,
    updateHistoryInvitationDto: UpdateHistoryInvitationDto,
  ) {
    return await this.historyModel.findByIdAndUpdate(
      id,
      updateHistoryInvitationDto,
      {
        new: true,
      },
    );
  }

  remove(id: number) {
    return `This action removes a #${id} historyInvitation`;
  }
}
