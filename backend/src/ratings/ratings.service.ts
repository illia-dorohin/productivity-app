import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Rating, RatingDocument } from './schemas/rating.schema';
import { UpsertRatingDto } from './dto/upsert-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectModel(Rating.name) private readonly ratingModel: Model<RatingDocument>,
  ) {}

  async getByDate(userId: string, date: string): Promise<RatingDocument | null> {
    return this.ratingModel.findOne({
      userId: new Types.ObjectId(userId),
      date,
    });
  }

  async getByDateRange(
    userId: string,
    from: string,
    to: string,
  ): Promise<RatingDocument[]> {
    return this.ratingModel
      .find({
        userId: new Types.ObjectId(userId),
        date: { $gte: from, $lte: to },
      })
      .sort({ date: 1 });
  }

  async upsert(
    userId: string,
    date: string,
    dto: UpsertRatingDto,
  ): Promise<RatingDocument> {
    const scores = dto.scores.map((s) => ({
      metricId: new Types.ObjectId(s.metricId),
      value: s.value,
    }));

    const rating = await this.ratingModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), date },
      { scores },
      { upsert: true, new: true },
    );

    return rating!;
  }
}
