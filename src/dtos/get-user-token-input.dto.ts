import {
  IsNotEmpty,
  IsString,
  Length,
  IsAlphanumeric,
} from 'class-validator';

export class GetUserTokenInput {
  @IsNotEmpty()
  @IsString()
  @Length(6, 100)
  password: string;

  @IsNotEmpty()
  @Length(4, 100)
  @IsAlphanumeric()
  username: string;
}
