import { Type } from 'class-transformer';
import { IsArray, IsMongoId, IsNumber, ValidateNested } from 'class-validator';

export class ReorderTaskItemDto {
  @IsMongoId()
  id: string;

  @IsNumber()
  order: number;
}

export class ReorderTasksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderTaskItemDto)
  items: ReorderTaskItemDto[];
}
