import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';

@Injectable()
export class FilesService {
  constructor(private configService: ConfigService) {}

  async uploadFile(name: string, format: string) {
    const s3 = new S3();

    return s3.getSignedUrlPromise('putObject', {
      Bucket: this.configService.get('AWS_BUCKET_NAME'),
      Key: `${name}.${format}`,
      Expires: parseInt(this.configService.get('AWS_EXPIRE_TIME'), 10),
    });
  }

  public async generatePresignedUrl(key: string) {
    const s3 = new S3();

    return s3.getSignedUrlPromise('getObject', {
      Bucket: this.configService.get('AWS_BUCKET_NAME'),
      Key: key,
      Expires: parseInt(this.configService.get('AWS_EXPIRE_TIME'), 10),
    });
  }
}
