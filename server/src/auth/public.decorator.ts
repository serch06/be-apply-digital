import { SetMetadata } from '@nestjs/common';

// Public decorator to establish the endpoint that are publics, since we set as private (JWT) by default or at global level.
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
