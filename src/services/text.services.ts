import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { Text } from '../entities/text.entity';
import { AppDataSource } from '../data-source';
import { AppLogger } from '../utils/app-logger';
import { NotFoundError } from 'routing-controllers';
import { LongestWordsInParagraph } from '../dtos/text-analysis.dto';
import { Cache } from '../utils/cache.decorator';


@Service()
export class TextService {
    private textRepo: Repository<Text>;
    constructor(
        private readonly logger: AppLogger
    ) {
        this.textRepo = AppDataSource.getRepository(Text);
    }

    async create(textContent: string, userId: string): Promise<Text> {
        this.logger.info(`${TextService.name}.create called`)

        const text = new Text();
        text.content = textContent;
        text.userId = userId;

        return await this.textRepo.save(text);
    }
    @Cache()
    async get(id: string, userId: string): Promise<Text> {
        this.logger.info(`${TextService.name}.get called`)

        const text = await this.textRepo.findOne({ where: { id: id, userId: userId } });

        if (!text) throw new NotFoundError('Text Content not found');

        return text
    }

    async update(id: string, textContent: string, userId: string): Promise<void> {
        this.logger.info(`${TextService.name}.update called`)

        await this.textRepo.update({ id: id, userId: userId }, { content: textContent });
    }
    async delete(id: string, userId: string): Promise<void> {
        this.logger.info(`${TextService.name}.delete called`)

        await this.textRepo.delete({ id: id, userId: userId });
    }

    @Cache()
    async getAllByUserId(userId: string): Promise<Text[]> {
        this.logger.info(`${TextService.name}.getAllByUserId called`)

        const texts = await this.textRepo.find({ where: { userId: userId } });

        return texts;
    }

    @Cache()
    async analyzeWordCount(textId: string, userId: string): Promise<number> {
        this.logger.info(`${TextService.name}.analyzeWordCount called`)

        const text = await this.get(textId, userId);
        return this.splitTextIntoWords(text.content).length;
    }

    @Cache()
    async analyzeCharacterCount(textId: string, userId: string): Promise<number> {
        this.logger.info(`${TextService.name}.analyzeCharacterCount called`)

        const text = await this.get(textId, userId);
        return text.content.replace(/\s+/g, '').length;
    }

    @Cache()
    async analyzeSentenceCount(textId: string, userId: string): Promise<number> {
        this.logger.info(`${TextService.name}.analyzeSentenceCount called`)

        const text = await this.get(textId, userId);
        const sentences = text.content.match(/[^\.!\?]+[\.!\?]+/g);
        return sentences ? sentences.length : 0;
    }

    @Cache()
    async analyzeParagraphCount(textId: string, userId: string): Promise<number> {
        this.logger.info(`${TextService.name}.analyzeParagraphCount called`)

        const text = await this.get(textId, userId);
        const paragraphs = text.content.split('\n\n');
        return paragraphs.filter(p => p.trim().length > 0).length;
    }

    @Cache()
    async findLongestWordsInParagraphs(textId: string, userId: string): Promise<LongestWordsInParagraph[]> {
        this.logger.info(`${TextService.name}.analyzeParagraphCount called`)

        const text = await this.get(textId, userId);
        const paragraphs = text.content.split('\n\n');

        const longestWordsPerParagraph: LongestWordsInParagraph[] = paragraphs.map((paragraphText, index) => {
            const words = this.splitTextIntoWords(paragraphText)

            if (words.length === 0) {
                return {
                    paragraph: index + 1,
                    longestWords: [],
                };
            }

            let maxLength = 0;
            for (const word of words) {
                if (word.length > maxLength) {
                    maxLength = word.length;
                }
            }

            const longestWords = words.filter(word => word.length === maxLength);

            const uniqueLongestWords = [...new Set(longestWords)];

            return {
                paragraph: index + 1,
                longestWords: uniqueLongestWords,
            };
        });

        return longestWordsPerParagraph
    }

    async getFullAnalysisReport(textId: string, userId: string): Promise<{
        wordCount: number;
        characterCount: number;
        sentenceCount: number;
        paragraphCount: number;
        longestWords: LongestWordsInParagraph[];
    }> {
        this.logger.info(`${TextService.name}.getFullAnalysisReport called`)

        const [wordCount, characterCount, sentenceCount, paragraphCount, longestWords] = await Promise.all([
            this.analyzeWordCount(textId, userId),
            this.analyzeCharacterCount(textId, userId),
            this.analyzeSentenceCount(textId, userId),
            this.analyzeParagraphCount(textId, userId),
            this.findLongestWordsInParagraphs(textId, userId),
        ]);

        return {
            wordCount,
            characterCount,
            sentenceCount,
            paragraphCount,
            longestWords,
        };
    }

    private splitTextIntoWords(text: string): string[] {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 0);
    }
}


