import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { compare, hash } from 'bcrypt';
import { User } from '../entities/user.entity';
import { AppDataSource } from '../data-source';
import { AppLogger } from '../utils/app-logger';
import { plainToClass } from 'class-transformer';
import { CreateUserInput } from '../dtos/create-user-input.dto';
import { UserOutput } from '../dtos/user-output.dto';
import { GetUserTokenInput } from '../dtos/get-user-token-input.dto';
import { GetUserTokenOutput } from '../dtos/get-user-token-output.dto';
import { UnauthorizedError } from 'routing-controllers';
import { generateToken } from '../utils/jwt';

@Service()
export class UserService {
    private userRepo: Repository<User>;
    constructor(
        private readonly logger: AppLogger
    ) {
        this.userRepo = AppDataSource.getRepository(User);
    }

    async create(input: CreateUserInput): Promise<UserOutput> {
        this.logger.info(`${UserService.name}.create called`)

        const user = new User();
        user.name = input.name;
        user.username = input.username;
        user.email = input.email;
        user.password = await hash(input.password, 10);

        const res = await this.userRepo.save(user);
        return plainToClass(UserOutput, user, {
            excludeExtraneousValues: true,
        });
    }

    async getUserToken(input: GetUserTokenInput): Promise<GetUserTokenOutput> {
        this.logger.info(`${UserService.name}.getUserToken called`)
        try {
            const user = await this.userRepo.findOne({ where: { username: input.username } });
            if (!user)
                throw new UnauthorizedError('Incorrect username. Please try again.');

            const match = await compare(input.password, user.password);
            if (!match)
                throw new UnauthorizedError('Incorrect password. Please try again.');

            const token = generateToken({ userId: user.id, username: user.username });

            return plainToClass(GetUserTokenOutput, { token: token }, {
                excludeExtraneousValues: true,
            });
        } catch (error) {
            throw error
        }
    }
}

