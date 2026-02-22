import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ApiTokenGuard implements CanActivate {
  // Hard-coded demo API token used to protect administrative endpoints.
  // In production this should be configurable, rotated, and stored securely.
  private readonly token = 'demo-supersecret-token';

  // Permit either a custom header `x-api-token` or an Authorization header
  // containing `Bearer <token>`. This guard throws UnauthorizedException on
  // missing or invalid token to produce an HTTP 401 response.
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers['x-api-token'] || request.headers['authorization'];
    if (!auth) throw new UnauthorizedException('Missing API token');
    const provided = Array.isArray(auth) ? auth[0] : auth;
    if (typeof provided === 'string' && provided.startsWith('Bearer ')) {
      const t = provided.slice(7).trim();
      if (t === this.token) return true;
    }
    if (provided === this.token) return true;
    throw new UnauthorizedException('Invalid API token');
  }
}
