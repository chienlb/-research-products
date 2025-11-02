import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

export type InvitationCodeDocument = HydratedDocument<InvitationCode>;

export enum InvitationCodeType {
  TRIAL = 'trial', // Dùng thử
  DISCOUNT = 'discount', // Giảm giá
  SPECIAL = 'special', // Đặc biệt
}

export interface IInvitationCode {
  code: string; // Mã mời dùng thử (6-10 ký tự), random tự động sau khi dùng
  event: string; // Sự kiện liên quan đến mã
  description?: string; // Mô tả về mã
  type?: InvitationCodeType; // Loại mã (ví dụ: "trial", "discount", "special")
  totalUses: number; // Tổng số lần sử dụng mã
  usesLeft: number; // Số lần sử dụng còn lại
  startedAt: Date; // Ngày bắt đầu có hiệu lực
  expiredAt: Date; // Ngày hết hạn
  isActive: boolean; // Mã còn hiệu lực không
  createdBy: Types.ObjectId; // ID người tạo mã
  updatedBy?: Types.ObjectId; // ID người cập nhật mã lần cuối
  createdAt?: Date; // Ngày tạo
  updatedAt?: Date; // Ngày cập nhật
}

export interface IInvitationCodeResponse extends IInvitationCode {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInvitationCodeInput extends Partial<IInvitationCode> {
  createdAt?: Date;
  updatedAt?: Date;
}

@Schema({ collection: 'invitation-codes', timestamps: true })
export class InvitationCode implements IInvitationCode {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  event: string;

  @Prop()
  description?: string;

  @Prop({ enum: InvitationCodeType, default: InvitationCodeType.TRIAL })
  type?: InvitationCodeType;

  @Prop({ required: true })
  totalUses: number;

  @Prop({ required: true })
  usesLeft: number;

  @Prop({ required: true })
  startedAt: Date;

  @Prop({ required: true })
  expiredAt: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true, type: Types.ObjectId, ref: 'users' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'users' })
  updatedBy?: Types.ObjectId;
}

export const InvitationCodeSchema =
  SchemaFactory.createForClass(InvitationCode);
