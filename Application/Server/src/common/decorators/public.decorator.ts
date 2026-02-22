import { SetMetadata } from '@nestjs/common';

// Metadata key used by JwtAuthGuard to mark handlers or controllers as
// publicly accessible (skip authentication). Use `@Public()` above a
// controller method or controller class to allow unauthenticated access.
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
