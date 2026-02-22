import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRatingDto {
  @ApiProperty({ example: 8 })
  @IsInt()
  @Min(1)
  @Max(10)
  score!: number;

  @ApiPropertyOptional({ example: 'Great movie' })
  @IsString()
  @IsOptional()
  review?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  movieId!: number;
}
