import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';
import { excludeFieldsPlugin } from '../../../common/plugin/excludeFields.plugin';

export type GroupMessageDocument = HydratedDocument<GroupMessage>;

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  AUDIO = 'audio',
  VIDEO = 'video',
  SYSTEM = 'system',
}

export interface IGroupMessage {
  groupId: Types.ObjectId; // ID nhóm hoặc lớp
  senderId: Types.ObjectId; // Người gửi
  content: string; // Nội dung tin nhắn (text)
  type: MessageType; // Loại tin nhắn
  attachments?: string[]; // Tệp đính kèm (nếu có)
  mentions?: Types.ObjectId[]; // Người được nhắc
  replyTo?: Types.ObjectId; // Tin nhắn được trả lời (nếu có)
  readBy?: Types.ObjectId[]; // Danh sách người đã đọc
  isEdited?: boolean; // Đã sửa chưa
  editedAt?: Date; // Thời điểm sửa
  deletedAt?: Date; // Thời điểm xóa (soft delete)
}

@Schema({ collection: 'group_messages', timestamps: true })
export class GroupMessage implements IGroupMessage {
  @Prop({ type: Types.ObjectId, ref: 'Group', required: true })
  groupId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({
    type: String,
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type: MessageType;

  @Prop({ type: [String], default: [] })
  attachments?: string[];

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  mentions?: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'GroupMessage' })
  replyTo?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  readBy?: Types.ObjectId[];

  @Prop({ default: false })
  isEdited?: boolean;

  @Prop()
  editedAt?: Date;

  @Prop()
  deletedAt?: Date;
}

export const GroupMessageSchema = SchemaFactory.createForClass(GroupMessage);
GroupMessageSchema.plugin(excludeFieldsPlugin);
// Middleware: cập nhật thời gian khi chỉnh sửa
GroupMessageSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  next();
});

// Index để tăng tốc tìm kiếm
GroupMessageSchema.index({ groupId: 1, createdAt: -1 });
GroupMessageSchema.index({ senderId: 1 });
GroupMessageSchema.index({ deletedAt: 1 });
