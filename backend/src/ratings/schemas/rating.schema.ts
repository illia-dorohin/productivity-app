import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RatingDocument = HydratedDocument<Rating>;

export class Score {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Metric' })
  metricId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  value: number;
}

@Schema({ timestamps: true })
export class Rating {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  date: string;

  @Prop({ type: [Score], default: [] })
  scores: Score[];
}

export const RatingSchema = SchemaFactory.createForClass(Rating);

RatingSchema.index({ userId: 1, date: 1 }, { unique: true });
