import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { Text } from '../entities/text.entity';
import { AppDataSource } from '../data-source';
import { AppLogger } from '../utils/app-logger';
import { NotFoundError } from 'routing-controllers';


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
}

