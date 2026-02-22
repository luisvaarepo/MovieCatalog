import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateActorDto {
  @ApiProperty({ example: 'Keanu Reeves' })
  @IsString()
  name!: string;
}
