import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { ApiSecurity, ApiTags, ApiOkResponse, ApiOperation, getSchemaPath, ApiExtraModels } from '@nestjs/swagger';
import { Actor } from './actor.entity';
import { ActorsService } from './actors.service';
import { CreateActorDto } from './dto/create-actor.dto';
import { UpdateActorDto } from './dto/update-actor.dto';
import { ApiTokenGuard } from '../../common/guards/api-token.guard';

@ApiTags('Actors')
@ApiExtraModels(Actor)
@Controller('actors')
export class ActorsController {
  constructor(private readonly svc: ActorsService) {}

  
  @Get()
  @ApiOperation({ summary: 'List actors' })
  @ApiOkResponse({
    description: 'Paged list of actors',
    schema: {
      type: 'object',
      properties: {
        items: { type: 'array', items: { $ref: getSchemaPath(Actor) } },
        total: { type: 'integer' },
        page: { type: 'integer' },
        limit: { type: 'integer' },
      },
    },
  })
  // List actors with basic pagination. Returns actor entities including their
  // related movies (via relation load configured in the service).
  findAll(@Query() query: any): Promise<{ items: any[]; total: number; page: number; limit: number }> {
    const p = query && query.page ? Number(query.page) : 1;
    const l = query && query.limit ? Number(query.limit) : 10;
    return this.svc.findAll(p, l) as Promise<{ items: any[]; total: number; page: number; limit: number }>;
  }

  @Get('search')
  search(@Query() query: any): Promise<{ items: any[]; total: number; page: number; limit: number }> {
    const q = query && query.q ? String(query.q) : '';
    const p = query && query.page ? Number(query.page) : 1;
    const l = query && query.limit ? Number(query.limit) : 10;
    return this.svc.searchByName(q, p, l) as Promise<{ items: any[]; total: number; page: number; limit: number }>;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(Number(id));
  }

  @Get(':id/movies')
  movies(@Param('id') id: string) {
    return this.svc.moviesForActor(Number(id));
  }

    // Administrative create/update/delete endpoints protected by API token.
  @Public()
  @UseGuards(ApiTokenGuard)
  @ApiSecurity('api-token')
  @Post()
  create(@Body() dto: CreateActorDto) {
    return this.svc.create(dto);
  }
  @Public()
  @UseGuards(ApiTokenGuard)
  @ApiSecurity('api-token')
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateActorDto) {
    return this.svc.update(Number(id), dto);
  }
  @Public()
  @UseGuards(ApiTokenGuard)
  @ApiSecurity('api-token')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(Number(id));
  }
}
