import { UserService } from '../../services/user.services';
import { User } from '../..//entities/user.entity';
import { AppLogger } from '../..//utils/app-logger';
import { CreateUserInput } from '../..//dtos/create-user-input.dto';
import { Repository } from 'typeorm';
import { AppDataSource } from '../..//data-source';

jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashedPassword123'),
}));

describe('UserService', () => {
    let userService: UserService;
    let mockLogger: Partial<Record<keyof AppLogger, jest.Mock>>;
    let mockUserRepo: Partial<Record<keyof Repository<User>, jest.Mock>>;

    const mockUserInput: CreateUserInput = {
        name: 'Zulfikar Ali',
        username: 'zulfikar',
        email: 'zulfikar@example.com',
        password: 'password123',
    };

    const mockSavedUser = {
        id: 'abc123',
        ...mockUserInput,
        password: 'hashedPassword123',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {

        mockUserRepo = {
            save: jest.fn().mockResolvedValue(mockSavedUser),
        };

        jest.spyOn(AppDataSource.manager, 'getRepository').mockReturnValue(mockUserRepo as unknown as Repository<User>);

        userService = new UserService(new AppLogger);
    });

    it('should create and return a user without password field', async () => {
        const result = await userService.create(mockUserInput);

        expect(result).toBeDefined();
        expect(result.id).toEqual(mockSavedUser.id);
        expect(result.name).toEqual(mockSavedUser.name);
        expect(result.username).toEqual(mockSavedUser.username);
        expect(result.email).toEqual(mockSavedUser.email);
        expect((result as any).password).toBeUndefined();
        expect(mockUserRepo.save).toHaveBeenCalledWith(expect.objectContaining({
            name: mockUserInput.name,
            username: mockUserInput.username,
            email: mockUserInput.email,
            password: 'hashedPassword123',
        }));
    });
});