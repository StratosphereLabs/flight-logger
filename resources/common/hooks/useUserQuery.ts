import { user } from '@prisma/client';

export interface UserResponse
  extends Pick<
    user,
    'username' | 'email' | 'firstName' | 'lastName' | 'admin'
  > {
  avatar: string;
}
