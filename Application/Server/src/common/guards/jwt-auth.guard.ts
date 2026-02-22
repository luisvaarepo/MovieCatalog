import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../../modules/auth/auth.service';

const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector, private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Respect the `@Public()` decorator which sets metadata to skip JWT checks.
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // Check the Authorization header for a Bearer token. As a convenience,
    // x-api-token may also be provided; in that case the ApiTokenGuard is used
    // at the controller level for administrative endpoints.
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] || request.headers['x-api-token'];
    if (!authHeader) throw new UnauthorizedException('Missing Authorization header');
    const provided = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    let token = provided;
    if (provided.startsWith('Bearer ')) token = provided.slice(7).trim();

    try {
      // Verify token signature/expiry via AuthService. If valid, attach the
      // decoded payload to `request.user` for downstream handlers to use.
      const payload = await this.authService.verifyToken(token);
      request.user = payload;
      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired JWT token');
    }
  }
}
