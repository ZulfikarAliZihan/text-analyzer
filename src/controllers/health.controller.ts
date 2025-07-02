import {
    Controller,
    Get,
    HttpCode,
    Authorized,
} from 'routing-controllers';


@Controller('/health')
export class TextController {
    constructor() { }
    @Get()
    @HttpCode(200)
    async healthCheck(): Promise<string> {
        return "Text Analyzer";
    }
}