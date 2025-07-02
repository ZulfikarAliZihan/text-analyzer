import {
    Controller,
    Get,
    HttpCode,
} from 'routing-controllers';
import { Service } from 'typedi';

@Service()
@Controller('/health')
export class HealthController {
    constructor() { }
    @Get()
    @HttpCode(200)
    async healthCheck(): Promise<string> {
        return "Text Analyzer";
    }
}