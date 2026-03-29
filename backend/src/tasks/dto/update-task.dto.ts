import {
  IsString,
  IsOptional,
  IsIn,
  IsNumber,
  Min,
  Max,
  IsArray,
  IsDateString,
} from 'class-validator';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsIn(['not_started', 'in_progress', 'done'])
  @IsOptional()
  status?: 'not_started' | 'in_progress' | 'done';

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;

  @IsIn(['high', 'medium', 'low'])
  @IsOptional()
  priority?: 'high' | 'medium' | 'low' | null;

  @IsDateString()
  @IsOptional()
  deadline?: string | null;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsNumber()
  @IsOptional()
  order?: number;
}
