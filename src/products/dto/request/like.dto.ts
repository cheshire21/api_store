import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsBoolean } from 'class-validator';
import { datatype } from 'faker';

@Exclude()
export class LikeDto {
  @ApiProperty({
    example: datatype.boolean(),
  })
  @Expose()
  @IsBoolean()
  like: boolean;
}
