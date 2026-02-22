import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';

export class UpdateRatingDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  score?: number;

  @IsOptional()
  @IsString()
  review?: string;

  @IsOptional()
  @IsInt()
  movieId?: number;
}
