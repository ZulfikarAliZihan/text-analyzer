import {
    Controller,
    Get,
    HttpCode,
} from 'routing-controllers';
import { Service, Inject } from 'typedi';
import { AppLogger } from '../utils/app-logger';

@Service()
@Controller('/health')
export class HealthController {
    constructor(
        private readonly logger: AppLogger
    ) { }
    @Get()
    @HttpCode(200)
    async healthCheck(): Promise<string> {
        this.logger.info(`${HealthController.name}.healthCheck called`)
        return "Text Analyzer";
    }
}