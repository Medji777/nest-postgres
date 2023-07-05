import { Injectable } from '@nestjs/common';
import { randomUUID as uuidV4 } from 'crypto';
import add from 'date-fns/add';
import { ConfirmModel } from '../types/users';

type options = {
  hours: number;
  minutes: number;
};

@Injectable()
export class ActiveCodeAdapter {
  public generateId() {
    return uuidV4();
  }
  public createCode(options?: options): ConfirmModel {
    return {
      confirmationCode: uuidV4(),
      expirationDate: add(new Date(), {
        hours: 1,
        minutes: 5,
        ...options,
      }),
      isConfirmed: false,
    };
  }
}
