import {
    JsonController,
    Body,
    HttpCode,
    Post,
    BadRequestError,
    UseBefore,
} from 'routing-controllers';
import { Service, Inject } from 'typedi';
import { AppLogger } from '../utils/app-logger';
import { UserService } from '../services/user.services';
import { CreateUserInput } from '../dtos/create-user-input.dto';
import { UserOutput } from '../dtos/user-output.dto';
import { isUniqueKeyViolationError } from '..//utils/database.error';
import { UNIQUE_USERS_EMAIL, UNIQUE_USERS_USERNAME } from '..//entities/user.entity';
import { GetUserTokenInput } from '../dtos/get-user-token-input.dto';
import { GetUserTokenOutput } from '../dtos/get-user-token-output.dto';
import { RateLimitMiddleware } from '../middlewares/rate-limit.middleware';

@Service()
@UseBefore(RateLimitMiddleware)
@JsonController('/users')
export class UserController {
    constructor(
        private readonly logger: AppLogger,
        @Inject() private userService: UserService
    ) { }
    @Post()
    @HttpCode(201)
    async createUser(@Body() user: CreateUserInput): Promise<UserOutput> {
        try {
            this.logger.info(`${UserController.name}.createUser called`)
            return this.userService.create(user)
        } catch (error) {
            if (isUniqueKeyViolationError(error, UNIQUE_USERS_EMAIL)) {
                throw new BadRequestError(
                    'The email has already been taken',
                );
            }
            if (isUniqueKeyViolationError(error, UNIQUE_USERS_USERNAME)) {
                throw new BadRequestError(
                    'The username has already been taken',
                );
            }
            throw error;
        }
    }

    @Post('/login')
    @HttpCode(200)
    async getToken(@Body() input: GetUserTokenInput): Promise<GetUserTokenOutput> {
        this.logger.info(`${UserController.name}.getToken called`)
        try {
            return this.userService.getUserToken(input)
        } catch (error) {
            throw error;
        }
    }
}