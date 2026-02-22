import { IsOptional, IsString } from 'class-validator';

export class UpdateActorDto {
  @IsOptional()
  @IsString()
  name?: string;
}
