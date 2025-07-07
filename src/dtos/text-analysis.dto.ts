import { Expose, Type } from 'class-transformer';

export class LongestWordsInParagraph {
    @Expose()
    paragraph: number;
    longestWords: string[];
}
