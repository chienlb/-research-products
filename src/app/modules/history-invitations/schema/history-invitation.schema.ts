import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';
import { excludeFieldsPlugin } from '../../../common/plugin/excludeFields.plugin';

export type HistoryInvitationDocument = HydratedDocument<HistoryInvitation>;

export interface IHistoryInvitation {
  userId: Types.ObjectId; // ID người dùng được mời
  code: string; // Mã mời đã sử dụng
  invitedAt: Date; // Ngày được mời
  status: string; // Trạng thái lời mời (accepted, pending, declined)
  createdAt?: Date; // Ngày tạo
  updatedAt?: Date; // Ngày cập nhật
}

export interface IHistoryInvitationInput extends Partial<IHistoryInvitation> {
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IHistoryInvitationResponse extends IHistoryInvitation {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Schema({ collection: 'history-invitations', timestamps: true })
export class HistoryInvitation implements IHistoryInvitation {
  @Prop({ required: true, type: Types.ObjectId, ref: 'users' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  invitedAt: Date;

  @Prop({ required: true })
  status: string;
}

export const HistoryInvitationSchema =
  SchemaFactory.createForClass(HistoryInvitation);
HistoryInvitationSchema.plugin(excludeFieldsPlugin);