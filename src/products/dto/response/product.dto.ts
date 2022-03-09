import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ResponseProductDto {
  @Expose()
  uuid: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  price: number;

  @Expose()
  stock: number;

  @Expose()
  category: { uuid: string; name: string };

  @Expose()
  status: boolean;

  @Expose()
  deletedAt: string;

  @Expose()
  updatedAt: string;

  @Expose()
  createdAt: string;
}
