import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { datatype } from 'faker';

@Exclude()
export class PaginationDto {
  @ApiProperty({
    example: 3,
  })
  @Expose()
  totalPages: number;

  @ApiProperty({
    example: 10,
  })
  @Expose()
  itemsPerPage: number;

  @ApiProperty({
    example: 30,
  })
  @Expose()
  totalItems: number;

  @ApiProperty({
    example: 2,
  })
  @Expose()
  currentPage: number;

  @ApiProperty({
    example: 3,
  })
  @Expose()
  nextPage: number | null;

  @ApiProperty({
    example: 1,
  })
  @Expose()
  previousPage: number | null;
}
