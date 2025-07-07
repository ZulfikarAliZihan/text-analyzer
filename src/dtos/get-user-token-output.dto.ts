import { Expose } from 'class-transformer';

export class GetUserTokenOutput {
  @Expose()
  token: string;
}
