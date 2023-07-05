import bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PassHashService {
  async create(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
  async validate(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }
}
