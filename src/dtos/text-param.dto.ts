import { IsUUID } from 'class-validator';

export class TextParam {
    @IsUUID()
    id: string;
}
