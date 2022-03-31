import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { datatype, name } from 'faker';
import { CategoryDetails } from './category-details.dto';
import { ImageDto } from './image.dto';

@Exclude()
export class ResponseProductDto {
  @ApiProperty({
    example: datatype.uuid(),
  })
  @Expose()
  uuid: string;

  @ApiProperty({
    example: name.firstName(),
  })
  @Expose()
  name: string;

  @ApiProperty({
    example: name.lastName(),
  })
  @Expose()
  description: string;

  @ApiProperty({
    example: datatype.float(),
  })
  @Expose()
  price: number;

  @ApiProperty({
    example: datatype.number(),
  })
  @Expose()
  stock: number;

  @ApiProperty()
  @Expose()
  category: CategoryDetails;

  @ApiProperty({
    example: datatype.number(),
  })
  @Expose()
  likes: number;

  @ApiProperty({
    example: datatype.number(),
  })
  @Expose()
  dislikes: number;

  @ApiProperty({
    example: datatype.boolean(),
  })
  @Expose()
  status: boolean;

  @Expose()
  images: ImageDto;

  @ApiProperty({
    example: null,
  })
  @Expose()
  deletedAt: string;

  @ApiProperty({
    example: datatype.datetime(),
  })
  @Expose()
  updatedAt: string;

  @ApiProperty({
    example: datatype.datetime(),
  })
  @Expose()
  createdAt: string;
}
