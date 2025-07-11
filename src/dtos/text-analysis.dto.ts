import { Expose, Type } from 'class-transformer';

export class WordCountOutput {
    @Expose()
    wordCount: number;
}

export class CharacterCountOutput {
    @Expose()
    characterCount: number;
}

export class SentenceCountOutput {
    @Expose()
    sentenceCount: number;
}

export class ParagraphCountOutput {
    @Expose()
    paragraphCount: number;
}

export class LongestWordsOutput {
    @Expose()
    @Type(() => LongestWordsInParagraph)
    paragraphs: LongestWordsInParagraph[];
}

export class LongestWordsInParagraph {
    @Expose()
    paragraph: number;
    @Expose()
    longestWords: string[];
}
export class TextAnalysisReport {
    @Expose()
    wordCount: number;

    @Expose()
    characterCount: number;

    @Expose()
    sentenceCount: number;

    @Expose()
    paragraphCount: number;

    @Expose()
    @Type(() => LongestWordsInParagraph)
    longestWords: LongestWordsInParagraph[];
}