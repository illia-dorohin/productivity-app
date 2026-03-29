import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

export type TaskStatus = 'not_started' | 'in_progress' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ default: 'not_started', enum: ['not_started', 'in_progress', 'done'] })
  status: TaskStatus;

  @Prop({ min: 0, max: 100 })
  progress: number;

  @Prop({ enum: ['high', 'medium', 'low'] })
  priority: TaskPriority;

  @Prop()
  deadline: Date;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: 0 })
  order: number;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.index({ userId: 1, order: 1 });
