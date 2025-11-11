import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';
import { excludeFieldsPlugin } from '../../../common/plugin/excludeFields.plugin';

export type DiscussionDocument = HydratedDocument<Discussion>;

export enum DiscussionType {
  POST = 'post', // Bài đăng thảo luận
  COMMENT = 'comment', // Bình luận
  MESSAGE = 'message', // Tin nhắn trong nhóm
}

export interface IDiscussion {
  groupId: Types.ObjectId; // Nhóm hoặc lớp (Class, Group)
  authorId: Types.ObjectId; // Người tạo bài viết
  parentId?: Types.ObjectId; // Nếu là comment, tham chiếu bài gốc
  type: DiscussionType;
  content: string; // Nội dung chính
  attachments?: string[]; // Ảnh / file đính kèm
  mentions?: Types.ObjectId[]; // Danh sách người được nhắc
  likes?: Types.ObjectId[]; // Người đã thả tim
  isPinned?: boolean; // Ghim bài
  isEdited?: boolean; // Đã chỉnh sửa chưa
  editedAt?: Date; // Thời gian chỉnh sửa
}

@Schema({ collection: 'discussions', timestamps: true })
export class Discussion implements IDiscussion {
  @Prop({ type: Types.ObjectId, ref: 'Group', required: true })
  groupId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Discussion' })
  parentId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: DiscussionType,
    default: DiscussionType.POST,
  })
  type: DiscussionType;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [String], default: [] })
  attachments?: string[];

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  mentions?: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  likes?: Types.ObjectId[];

  @Prop({ default: false })
  isPinned?: boolean;

  @Prop({ default: false })
  isEdited?: boolean;

  @Prop()
  editedAt?: Date;
}

export const DiscussionSchema = SchemaFactory.createForClass(Discussion);
DiscussionSchema.plugin(excludeFieldsPlugin);
// Tự động đánh dấu thời gian khi chỉnh sửa
DiscussionSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  next();
});

DiscussionSchema.index({ groupId: 1, parentId: 1 });
DiscussionSchema.index({ authorId: 1 });
DiscussionSchema.index({ createdAt: -1 });
