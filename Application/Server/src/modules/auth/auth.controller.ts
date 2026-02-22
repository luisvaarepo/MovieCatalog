import { Controller, Post, Body } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

type AuthDto = { username: string; password: string };

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login and receive JWT access token' })
  @ApiBody({ schema: { type: 'object', properties: { username: { type: 'string' }, password: { type: 'string' } } } })
  @ApiResponse({ status: 201, description: 'Returns access token', schema: { example: { access_token: 'eyJ...' } } })
  async login(@Body() body: AuthDto) {
    return this.authService.login(body.username, body.password);
  }

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register a new user (in-memory)' })
  @ApiBody({ schema: { type: 'object', properties: { username: { type: 'string' }, password: { type: 'string' } } } })
  @ApiResponse({ status: 201, description: 'Created user', schema: { example: { user: { id: 2, username: 'newuser' } } } })
  async register(@Body() body: AuthDto) {
    const user = await this.authService.register(body.username, body.password);
    return { user };
  }
}
