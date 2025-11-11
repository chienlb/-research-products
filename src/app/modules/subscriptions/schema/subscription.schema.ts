import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { excludeFieldsPlugin } from '../../../common/plugin/excludeFields.plugin';

export type SubscriptionDocument = HydratedDocument<Subscription>;

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PENDING = 'pending',
}

export interface ISubscription {
  userId: Types.ObjectId; // ID người dùng
  packageId: Types.ObjectId; // ID gói đăng ký
  startDate: Date; // Ngày bắt đầu
  endDate: Date; // Ngày kết thúc
  status: SubscriptionStatus; // Trạng thái đăng ký
  autoRenew: boolean; // Tự động gia hạn
  paymentId?: Types.ObjectId; // ID giao dịch thanh toán
  createdAt?: Date; // Ngày tạo
  updatedAt?: Date; // Ngày cập nhật
}

@Schema({ collection: 'subscriptions', timestamps: true })
export class Subscription implements ISubscription {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Package', required: true })
  packageId: Types.ObjectId;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({
    type: String,
    enum: SubscriptionStatus,
    default: SubscriptionStatus.PENDING,
  })
  status: SubscriptionStatus;

  @Prop({ default: false })
  autoRenew: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Payment' })
  paymentId?: Types.ObjectId;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
SubscriptionSchema.plugin(excludeFieldsPlugin);
// Middleware: tự động cập nhật trạng thái khi hết hạn
SubscriptionSchema.pre('save', function (next) {
  const now = new Date();
  if (this.endDate < now) this.status = SubscriptionStatus.EXPIRED;
  next();
});

SubscriptionSchema.index({ userId: 1, packageId: 1 });
SubscriptionSchema.index({ status: 1 });
