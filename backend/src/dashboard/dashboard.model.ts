import { UserRole } from '@prisma/client';

export class UserDto {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}
