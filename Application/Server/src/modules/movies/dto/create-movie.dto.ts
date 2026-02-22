import { IsString, IsOptional, IsArray, ArrayUnique } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMovieDto {
  @ApiProperty({ example: 'The Matrix' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ example: 'A hacker learns about reality' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: [Number] })
  @IsArray()
  @IsOptional()
  @ArrayUnique()
  actorIds?: number[];
}
