import {
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';

export class UpdateTextInput {
  @IsNotEmpty()
  @Length(4, 2000)
  @IsString()
  content: string;
}
