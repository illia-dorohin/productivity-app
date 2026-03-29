import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MetricDocument = HydratedDocument<Metric>;

export type MetricType = 'group' | 'rating';

@Schema({ timestamps: true })
export class Metric {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  slug: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Metric', default: null })
  parentId: Types.ObjectId | null;

  @Prop({ required: true, enum: ['group', 'rating'] })
  type: MetricType;

  @Prop({ default: 1 })
  weight: number;

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const MetricSchema = SchemaFactory.createForClass(Metric);

MetricSchema.index({ userId: 1, parentId: 1, order: 1 });
MetricSchema.index({ userId: 1, slug: 1 }, { unique: true });
