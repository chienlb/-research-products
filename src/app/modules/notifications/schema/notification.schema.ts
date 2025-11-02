import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

export enum NotificationType {
  SYSTEM = 'system', // Hệ thống
  MESSAGE = 'message', // Tin nhắn
  REMINDER = 'reminder', // Nhắc nhở
  ALERT = 'alert', // Cảnh báo
  ASSIGNMENT = 'assignment', // Bài tập
  COMPETITION = 'competition', // Cuộc thi
}

export interface INotification {
  userId: Types.ObjectId; // Người nhận thông báo
  senderId?: Types.ObjectId; // Người gửi (nếu có)
  title: string; // Tiêu đề
  message: string; // Nội dung
  type: NotificationType; // Loại thông báo
  data?: Record<string, any>; // Dữ liệu đính kèm (ví dụ: link đến bài tập, cuộc thi)
  firebaseToken?: string; // Token Firebase để gửi FCM
  isRead: boolean; // Đã đọc hay chưa
  readAt?: Date; // Thời gian đọc
}

@Schema({ collection: 'notifications', timestamps: true })
export class Notification implements INotification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  senderId?: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({
    type: String,
    enum: NotificationType,
    default: NotificationType.SYSTEM,
  })
  type: NotificationType;

  @Prop({ type: Object })
  data?: Record<string, any>;

  @Prop()
  firebaseToken?: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  readAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Middleware: đánh dấu readAt khi isRead = true
NotificationSchema.pre('save', function (next) {
  if (this.isRead && !this.readAt) this.readAt = new Date();
  next();
});

NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ type: 1, createdAt: -1 });
