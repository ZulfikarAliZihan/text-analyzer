import { TextService } from '../../services/text.services';
import { Text } from '../../entities/text.entity';
import { AppLogger } from '../../utils/app-logger';
import { NotFoundError } from 'routing-controllers';
import { AppDataSource } from '../../data-source';
import { Repository } from 'typeorm';
import { CreateUserInput } from '../../dtos/create-user-input.dto';
import { User } from '../../entities/user.entity';

jest.mock('../../data-source');
jest.mock('../../utils/app-logger');

describe('TextService', () => {
    let service: TextService;
    let mockRepo: jest.Mocked<Repository<Text>>;
    let mockLogger: jest.Mocked<AppLogger>;

    const textContent = 'hello';
    const mockUser: User = {
        id: 'user-123',
        name: 'Zulfikar Ali',
        username: 'zulfikar',
        email: 'zulfikar@example.com',
        password: 'password123',
        createdAt: new Date(),
        updatedAt: new Date()
    };
    const text: Text = {
        id: '1',
        content: 'hello',
        userId: mockUser.id,
        user: mockUser,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    beforeEach(() => {
        mockRepo = {
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            find: jest.fn(),
        } as any;

        mockLogger = {
            info: jest.fn(),
        } as any;

        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepo);

        service = new TextService(mockLogger);
    });

    describe('create', () => {
        it('should create and save text', async () => {


            const savedText = {
                id: '1', content: textContent, userId: mockUser.id,
                createdAt: new Date(), updatedAt: new Date(), user: mockUser
            };

            mockRepo.save.mockResolvedValue(savedText);

            const result = await service.create(textContent, mockUser.id);

            expect(mockLogger.info).toHaveBeenCalledWith('TextService.create called');
            expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({ content: textContent, userId: mockUser.id }));
            expect(result).toEqual(savedText);
        });
    });

    describe('get', () => {
        it('should return the text when found', async () => {
            mockRepo.findOne.mockResolvedValue(text);

            const result = await service.get('1', mockUser.id);

            expect(mockLogger.info).toHaveBeenCalledWith('TextService.get called');
            expect(result).toEqual(text);
        });

        it('should throw NotFoundError if text not found', async () => {
            mockRepo.findOne.mockResolvedValue(null);

            await expect(service.get('1', 'user-123')).rejects.toThrow(NotFoundError);
        });
    });

    describe('update', () => {
        it('should call update on repository', async () => {
            mockRepo.update.mockResolvedValue(null);

            await service.update('1', 'new text', 'user-123');

            expect(mockLogger.info).toHaveBeenCalledWith('TextService.update called');
            expect(mockRepo.update).toHaveBeenCalledWith({ id: '1', userId: 'user-123' }, { content: 'new text' });
        });
    });

    describe('delete', () => {
        it('should call delete on repository', async () => {
            mockRepo.delete.mockResolvedValue(null);

            await service.delete('1', 'user-123');

            expect(mockLogger.info).toHaveBeenCalledWith('TextService.delete called');
            expect(mockRepo.delete).toHaveBeenCalledWith({ id: '1', userId: 'user-123' });
        });
    });

    describe('getAllByUserId', () => {
        it('should return all texts for the user', async () => {
            const texts = [text];
            mockRepo.find.mockResolvedValue(texts);

            const result = await service.getAllByUserId(mockUser.id);

            expect(mockLogger.info).toHaveBeenCalledWith('TextService.getAllByUserId called');
            expect(mockRepo.find).toHaveBeenCalledWith({ where: { userId: mockUser.id } });
            expect(result).toEqual(texts);
        });
    });
});
