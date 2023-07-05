import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { settings } from '../config';

type EmailBody = {
  email: string;
  subject: string;
  message: string;
};

@Injectable()
export class EmailAdapter {
  private async send(payload: EmailBody) {
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: settings.EMAIL_USER,
        pass: settings.EMAIL_PASS,
      },
    });

    return transport.sendMail({
      from: `Vladimir <${settings.EMAIL_USER}>`,
      to: payload.email,
      subject: payload.subject,
      html: payload.message,
    });
  }
  async sendCodeConfirmationMessage(
    email: string,
    confirmationCode: string,
    action: string,
  ): Promise<void> {
    await this.send({
      email: email,
      subject: 'confirmation code',
      message:
        '<h1>Thank for your registration</h1>\n' +
        '<p>To finish registration please follow the link below:\n' +
        "<a href='https://" + settings.EMAIL_BASE_URI + '/' + action + '?code=' + confirmationCode + "'>complete registration</a>\n" +
        '</p>',
    });
  }
  async sendRecoveryCodeConfirmationMessage(
    email: string,
    confirmationCode: string,
    action: string,
  ): Promise<void> {
    await this.send({
      email: email,
      subject: 'confirmation code',
      message:
        '<h1>Password recovery</h1>\n' +
        '<p>To finish password recovery please follow the link below:\n' +
        "<a href='https://" + settings.EMAIL_BASE_URI + '/' + action + '?recoveryCode=' + confirmationCode + "'>recovery password</a>\n" +
        '</p>',
    });
  }
}
