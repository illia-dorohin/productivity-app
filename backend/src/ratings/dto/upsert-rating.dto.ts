import { Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNumber,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class ScoreDto {
  @IsMongoId()
  metricId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  value: number;
}

export class UpsertRatingDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScoreDto)
  scores: ScoreDto[];
}
