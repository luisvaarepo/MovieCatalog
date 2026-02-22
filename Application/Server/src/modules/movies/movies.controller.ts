import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { ApiTokenGuard } from '../../common/guards/api-token.guard';

@ApiTags('Movies')
@Controller('movies')
export class MoviesController {
  constructor(private readonly svc: MoviesService) {}

  @Get()
  // Public read endpoint: list movies with pagination. Controlled by query
  // parameters `page` and `limit`. Returns items, total count and paging info.
  findAll(@Query() query: any): Promise<{ items: any[]; total: number; page: number; limit: number }> {
    const p = query && query.page ? Number(query.page) : 1;
    const l = query && query.limit ? Number(query.limit) : 10;
    return this.svc.findAll(p, l) as Promise<{ items: any[]; total: number; page: number; limit: number }>;
  }

  @Get('search')
  // Search movies by title. Case-insensitive substring match via service.
  search(@Query() query: any): Promise<{ items: any[]; total: number; page: number; limit: number }> {
    const q = query && query.q ? String(query.q) : '';
    const p = query && query.page ? Number(query.page) : 1;
    const l = query && query.limit ? Number(query.limit) : 10;
    return this.svc.searchByTitle(q, p, l) as Promise<{ items: any[]; total: number; page: number; limit: number }>;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(Number(id));
  }

  // Administrative endpoints that modify data are protected by an API token.
  // They are marked `@Public()` so the global JWT guard is skipped, and the
    // `ApiTokenGuard` enforces possession of the configured API key header.
  @Public()
  @UseGuards(ApiTokenGuard)
  @ApiSecurity('api-token')
  @Post()
  create(@Body() dto: CreateMovieDto) {
    return this.svc.create(dto);
  }
  @Public()
  @UseGuards(ApiTokenGuard)
  @ApiSecurity('api-token')
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMovieDto) {
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
