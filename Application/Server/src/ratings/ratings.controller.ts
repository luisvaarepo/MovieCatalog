import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { ApiTokenGuard } from '../common/guards/api-token.guard';

@ApiTags('Ratings')
@Controller('ratings')
export class RatingsController {
  constructor(private readonly svc: RatingsService) {}

  // Public endpoint: list all ratings with their associated movie.
  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(Number(id));
  }

  // Create/update/delete rating endpoints are protected by API token since
  // they modify persistent data. They intentionally bypass the global JWT
    // guard (using @Public()) and rely on the simpler API token guard.
  @Public()
  @UseGuards(ApiTokenGuard)
  @ApiSecurity('api-token')
  @Post()
  create(@Body() dto: CreateRatingDto) {
    return this.svc.create(dto);
  }
  @Public()
  @UseGuards(ApiTokenGuard)
  @ApiSecurity('api-token')
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRatingDto) {
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
