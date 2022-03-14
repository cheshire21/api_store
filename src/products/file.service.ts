import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';

@Injectable()
export class FilesService {
  constructor(private configService: ConfigService) {}

  async uploadFile(dataBuffer: Buffer, key: string) {
    const s3 = new S3();
    const uploadResult = await s3
      .upload({
        Bucket: this.configService.get('AWS_BUCKET_NAME'),
        Body: dataBuffer,
        Key: key,
      })
      .promise();

    return {
      key: uploadResult.Key,
    };
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
