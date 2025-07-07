



import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { Text } from '../entities/text.entity';
import { AppDataSource } from '../data-source';
import { AppLogger } from '../utils/app-logger';
import { NotFoundError } from 'routing-controllers';
import { LongestWordsInParagraph } from '../dtos/text-analysis.dto';


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

    async getAllByUserId(userId: string): Promise<Text[]> {
        this.logger.info(`${TextService.name}.getAllByUserId called`)

        const texts = await this.textRepo.find({ where: { userId: userId } });

        return texts;
    }

    async analyzeWordCount(textId: string, userId: string): Promise<number> {
        this.logger.info(`${TextService.name}.analyzeWordCount called`)

        const text = await this.get(textId, userId);
        return this.splitTextIntoWords(text.content).length;
    }

    async analyzeCharacterCount(textId: string, userId: string): Promise<number> {
        this.logger.info(`${TextService.name}.analyzeCharacterCount called`)

        const text = await this.get(textId, userId);
        return text.content.replace(/\s+/g, '').length;
    }

    async analyzeSentenceCount(textId: string, userId: string): Promise<number> {
        this.logger.info(`${TextService.name}.analyzeSentenceCount called`)

        const text = await this.get(textId, userId);
        const sentences = text.content.match(/[^\.!\?]+[\.!\?]+/g);
        return sentences ? sentences.length : 0;
    }

    async analyzeParagraphCount(textId: string, userId: string): Promise<number> {
        this.logger.info(`${TextService.name}.analyzeParagraphCount called`)

        const text = await this.get(textId, userId);
        const paragraphs = text.content.split('\n\n');
        return paragraphs.filter(p => p.trim().length > 0).length;
    }

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

    private splitTextIntoWords(text: string): string[] {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 0);
    }
}


