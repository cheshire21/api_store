import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsNotEmpty } from 'class-validator';
import { datatype } from 'faker';

@Exclude()
export class StatusProductDto {
  @ApiProperty({
    example: datatype.boolean(),
  })
  @Expose()
  @IsNotEmpty()
  @IsBoolean()
  status: boolean;
}
