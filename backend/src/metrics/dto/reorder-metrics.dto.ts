import { Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';

export class ReorderItemDto {
  @IsMongoId()
  id: string;

  @IsNumber()
  order: number;

  @IsMongoId()
  @IsOptional()
  parentId?: string | null;
}

export class ReorderMetricsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}
