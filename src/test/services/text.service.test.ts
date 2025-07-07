import { TextService } from '../../services/text.services';
import { Text } from '../../entities/text.entity';
import { AppLogger } from '../../utils/app-logger';
import { NotFoundError } from 'routing-controllers';
import { AppDataSource } from '../../data-source';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

jest.mock('../../data-source');
jest.mock('../../utils/app-logger');

describe('TextService', () => {
    let service: TextService;
    let mockRepo: jest.Mocked<Repository<Text>>;
    let mockLogger: jest.Mocked<AppLogger>;

    const textContent = 'Hello. How are you? Fine!';
    const mockUser: User = {
        id: 'user-123',
        name: 'Zulfikar Ali',
        username: 'zulfikar',
        email: 'zulfikar@example.com',
        password: 'password123',
        createdAt: new Date(),
        updatedAt: new Date()
    };
    const mockTextId = 'ba1f4f6a-c986-433c-87e6-1a215ce436fa';
    const text: Text = {
        id: mockTextId,
        content: textContent,
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

            const result = await service.get(mockTextId, mockUser.id);

            expect(mockLogger.info).toHaveBeenCalledWith('TextService.get called');
            expect(result).toEqual(text);
        });

        it('should throw NotFoundError if text not found', async () => {
            mockRepo.findOne.mockResolvedValue(null);

            await expect(service.get(mockTextId, mockUser.id)).rejects.toThrow(NotFoundError);
        });
    });

    describe('update', () => {
        it('should call update on repository', async () => {
            mockRepo.update.mockResolvedValue(null);

            await service.update(mockTextId, 'new text', mockUser.id);

            expect(mockLogger.info).toHaveBeenCalledWith('TextService.update called');
            expect(mockRepo.update).toHaveBeenCalledWith({ id: mockTextId, userId: mockUser.id }, { content: 'new text' });
        });
    });

    describe('delete', () => {
        it('should call delete on repository', async () => {
            mockRepo.delete.mockResolvedValue(null);

            await service.delete(mockTextId, mockUser.id);

            expect(mockLogger.info).toHaveBeenCalledWith('TextService.delete called');
            expect(mockRepo.delete).toHaveBeenCalledWith({ id: mockTextId, userId: mockUser.id });
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

    describe('analyzeWordCount', () => {
        it('should return the number of words', async () => {
            mockRepo.findOne.mockResolvedValue(text);

            const result = await service.analyzeWordCount(mockTextId, mockUser.id);

            expect(result).toBe(5);
        });
    });

    describe('analyzeCharacterCount', () => {
        it('should return character count excluding spaces', async () => {
            mockRepo.findOne.mockResolvedValue(text);

            const result = await service.analyzeCharacterCount(mockTextId, mockUser.id);

            expect(result).toBe(21);
        });
    });

    describe('analyzeSentenceCount', () => {
        it('should count sentences ending in .!?', async () => {
            mockRepo.findOne.mockResolvedValue(text);

            const result = await service.analyzeSentenceCount(mockTextId, mockUser.id);

            expect(result).toBe(3);
        });

        it('should return 0 if no sentence-ending punctuation', async () => {
            const newText = text;
            newText.content = 'This is not a sentence split';
            mockRepo.findOne.mockResolvedValue(newText);

            const result = await service.analyzeSentenceCount(mockTextId, mockUser.id);
            expect(result).toBe(0);
        });
    });

    describe('analyzeParagraphCount', () => {
        it('should count non-empty paragraphs separated by \\n\\n', async () => {
            const newText = text;
            newText.content = 'First paragraph.\n\nSecond paragraph.\n\nThird.';
            mockRepo.findOne.mockResolvedValue(newText);

            const result = await service.analyzeParagraphCount(mockTextId, mockUser.id);
            expect(result).toBe(3);
        });

        it('should ignore empty paragraphs', async () => {
            const newText = text;
            newText.content = 'Para 1\n\n\n\nPara 2';
            mockRepo.findOne.mockResolvedValue(newText);

            const result = await service.analyzeParagraphCount(mockTextId, mockUser.id);
            expect(result).toBe(2);
        });
    });

    describe('findLongestWordsInParagraphs', () => {
        it('should return longest unique words for each paragraph', async () => {
            const newText = text;
            newText.content = 'Short longword longest\n\nAnother line longestwordinpara2 short';
            mockRepo.findOne.mockResolvedValue(text);

            const result = await service.findLongestWordsInParagraphs(mockTextId, mockUser.id);

            expect(result).toEqual([
                { paragraph: 1, longestWords: ['longword'] },
                { paragraph: 2, longestWords: ['longestwordinpara2'] },
            ]);
        });

        it('should return empty array for paragraphs with no words', async () => {
            const newText = text;
            newText.content = '\n\n\n\n';
            mockRepo.findOne.mockResolvedValue(newText);

            const result = await service.findLongestWordsInParagraphs(mockTextId, mockUser.id);

            expect(result).toEqual([
                { paragraph: 1, longestWords: [] },
                { paragraph: 2, longestWords: [] },
                { paragraph: 3, longestWords: [] },
            ]);
        });

        it('should remove punctuation and return lowercase', async () => {
            const newText = text;
            newText.content = 'Word, wordy. longest! longest?';
            mockRepo.findOne.mockResolvedValue(newText);

            const result = await service.findLongestWordsInParagraphs(mockTextId, mockUser.id);

            expect(result).toEqual([
                { paragraph: 1, longestWords: ['longest'] }
            ]);
        });
    });

});
