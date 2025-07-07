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
import { Service, Inject } from 'typedi';
import { Request } from 'express';
import { Text } from '../entities/text.entity';
import { AppLogger } from '../utils/app-logger';
import { TextService } from '../services/text.services';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { TextParam } from '../dtos/text-param.dto';
import { CreateTextInput } from '../dtos/create-text-input.dto';
import { UpdateTextInput } from '../dtos/update-text-input.dto';

@Service()
@UseBefore(AuthMiddleware)
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
}