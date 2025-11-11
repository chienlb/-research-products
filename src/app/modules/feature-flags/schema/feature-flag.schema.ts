import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { excludeFieldsPlugin } from '../../../common/plugin/excludeFields.plugin';

export type FeatureFlagDocument = HydratedDocument<FeatureFlag>;

export enum FlagScope {
  GLOBAL = 'global', // Áp dụng toàn hệ thống
  USER = 'user', // Theo người dùng cụ thể
  ROLE = 'role', // Theo vai trò (giáo viên, học sinh, phụ huynh)
  EXPERIMENT = 'experiment', // Cho thử nghiệm A/B
}

export interface IFeatureFlag {
  flagName: string; // Tên cờ tính năng
  isEnabled: boolean; // Cờ có được bật không
  scope: FlagScope; // Phạm vi áp dụng
  targetIds?: string[]; // Danh sách ID cụ thể nếu áp dụng cho người dùng/nhóm
  createdBy?: Types.ObjectId; // Ai đã tạo cờ này
  updatedBy?: Types.ObjectId; // Ai cập nhật lần cuối
}

@Schema({ collection: 'feature-flags', timestamps: true })
export class FeatureFlag implements IFeatureFlag {
  @Prop({ required: true })
  flagName: string;

  @Prop({ required: true })
  isEnabled: boolean;

  @Prop({ required: true, enum: FlagScope })
  scope: FlagScope;

  @Prop({ type: [String], default: [] })
  targetIds?: string[];

  @Prop({ type: Types.ObjectId, ref: 'users' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'users' })
  updatedBy?: Types.ObjectId;
}

export const FeatureFlagSchema = SchemaFactory.createForClass(FeatureFlag);
FeatureFlagSchema.plugin(excludeFieldsPlugin);