import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateUserInput {
  @IsNotEmpty()
  @Length(4, 100)
  @IsString()
  name: string;

  @IsNotEmpty()
  @Length(4, 100)
  @IsAlphanumeric()
  username: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 100)
  password: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  email: string;
}
