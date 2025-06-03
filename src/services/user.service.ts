import { PrismaClient, User } from '../../generated/prisma';
import { NotFoundError } from '../utils/errors';
import * as crypto from 'crypto';

export class UserService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  public async getUserById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundError(`User with id ${id} not found`);
    }

    return user;
  }
}
