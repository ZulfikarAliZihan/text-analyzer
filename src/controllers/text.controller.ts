import {
    JsonController,
    Get,
    Post,
    Put,
    Delete,
    Body,
    HttpCode,
    Req,
    UseBefore,
    Params,
} from 'routing-controllers';
import {
    CharacterCountOutput,
    LongestWordsOutput,
    ParagraphCountOutput,
    SentenceCountOutput,
    WordCountOutput
} from '../dtos/text-analysis.dto';
import { Service, Inject } from 'typedi';
import { Request } from 'express';
import { Text } from '../entities/text.entity';
import { AppLogger } from '../utils/app-logger';
import { TextService } from '../services/text.services';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { TextParam } from '../dtos/text-param.dto';
import { CreateTextInput } from '../dtos/create-text-input.dto';
import { UpdateTextInput } from '../dtos/update-text-input.dto';
import { plainToClass } from 'class-transformer';
import { RateLimitMiddleware } from '../middlewares/rate-limit.middleware';

@Service()
@UseBefore(AuthMiddleware)
@UseBefore(RateLimitMiddleware)
@JsonController('/texts')
export class TextController {
    constructor(
        private readonly logger: AppLogger,
        @Inject() private textService: TextService
    ) { }

    @Post()
    @HttpCode(201)
    async createText(
        @Body() body: CreateTextInput,
        @Req() request: Request
    ): Promise<{ id: string }> {
        this.logger.info(`${TextController.name}.createText called`)
        const userId = request['user']?.userId;
        return this.textService.create(body.content, userId);
    }

    @Get('/:id')
    @HttpCode(200)
    async getText(
        @Params() params: TextParam,
        @Req() request: Request
    ): Promise<Text> {
        this.logger.info(`${TextController.name}.getText called`)
        const userId = request['user']?.userId;
        return this.textService.get(params.id, userId);
    }

    @Put('/:id')
    @HttpCode(204)
    async updateText(
        @Params() params: TextParam,
        @Req() request: Request,
        @Body() body: UpdateTextInput
    ): Promise<void> {
        this.logger.info(`${TextController.name}.updateText called`)
        const userId = request['user']?.userId;
        await this.textService.update(params.id, body.content, userId);
        return null
    }

    @Delete('/:id')
    @HttpCode(204)
    async deleteText(
        @Params() params: TextParam,
        @Req() request: Request,
    ): Promise<void> {
        this.logger.info(`${TextController.name}.deleteText called`)
        const userId = request['user']?.userId;
        await this.textService.delete(params.id, userId);
        return null;
    }

    @Get()
    @HttpCode(200)
    async getAllUserTexts(@Req() request: Request): Promise<Text[]> {
        this.logger.info(`${TextController.name}.getAllUserTexts called`)
        const userId = request['user']?.userId;
        return this.textService.getAllByUserId(userId);
    }

    @Get('/:id/word-count')
    @HttpCode(200)
    async getWordCount(
        @Params() params: TextParam,
        @Req() request: Request,
    ): Promise<WordCountOutput> {
        this.logger.info(`${TextController.name}.getWordCount called`);
        const userId = request['user']?.userId;
        const wordCount = await this.textService.analyzeWordCount(params.id, userId);

        return plainToClass(WordCountOutput, { wordCount: wordCount }, {
            excludeExtraneousValues: true,
        });
    }

    @Get('/:id/character-count')
    @HttpCode(200)
    async getCharacterCount(
        @Params() params: TextParam,
        @Req() request: Request,
    ): Promise<CharacterCountOutput> {
        this.logger.info(`${TextController.name}.getCharacterCount called`);
        const userId = request['user']?.userId;
        const characterCount = await this.textService.analyzeCharacterCount(params.id, userId);

        return plainToClass(CharacterCountOutput, { characterCount: characterCount }, {
            excludeExtraneousValues: true,
        });
    }

    @Get('/:id/sentence-count')
    @HttpCode(200)
    async getSentenceCount(
        @Params() params: TextParam,
        @Req() request: Request,
    ): Promise<SentenceCountOutput> {
        this.logger.info(`${TextController.name}.getSentenceCount called`);
        const userId = request['user']?.userId;
        const sentenceCount = await this.textService.analyzeSentenceCount(params.id, userId);

        return plainToClass(SentenceCountOutput, { sentenceCount: sentenceCount }, {
            excludeExtraneousValues: true,
        });
    }

    @Get('/:id/paragraph-count')
    @HttpCode(200)
    async getParagraphCount(
        @Params() params: TextParam,
        @Req() request: Request,
    ): Promise<{ paragraphCount: number }> {
        this.logger.info(`${TextController.name}.getParagraphCount called`);
        const userId = request['user']?.userId;
        const paragraphCount = await this.textService.analyzeParagraphCount(params.id, userId);

        return plainToClass(ParagraphCountOutput, { paragraphCount: paragraphCount }, {
            excludeExtraneousValues: true,
        });
    }

    @Get('/:id/longest-words')
    @HttpCode(200)
    async getLongestWords(
        @Params() params: TextParam,
        @Req() request: Request,
    ): Promise<LongestWordsOutput> {
        this.logger.info(`${TextController.name}.getLongestWords called`);
        const userId = request['user']?.userId;
        const longestWords = await this.textService.findLongestWordsInParagraphs(params.id, userId);

        return plainToClass(LongestWordsOutput, { paragraphs: longestWords });
    }
}
