import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class SendgridService {
  constructor(private readonly configService: ConfigService) {
    SendGrid.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
  }

  async send(mail) {
    const data = {
      ...mail,
      from: this.configService.get<string>('SENDGRID_EMAIL'),
    };
    const transport = await SendGrid.send(data);
    console.log(`E-Mail sent to ${mail.to}`);
    return transport;
  }
}
