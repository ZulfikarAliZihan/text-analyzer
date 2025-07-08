import 'reflect-metadata';
import * as request from 'supertest';
import { createExpressServer, useContainer } from 'routing-controllers';
import Container from 'typedi';
import { TextController } from '../../controllers/text.controller';
import { TextService } from '../../services/text.services';
import { AppLogger } from '../../utils/app-logger';
import { Text } from '../../entities/text.entity';
import { AuthMiddleware } from '../../middlewares/auth.middleware';

jest.mock('../../middlewares/auth.middleware', () => {
    return {
        AuthMiddleware: class {
            use(req: any, res: any, next: any) {
                req.user = { userId: 'user-123' };
                next();
            }
        }
    };
});

jest.mock('../../utils/app-logger');

describe('TextController', () => {
    let app: any;
    const mockTextService = {
        create: jest.fn(),
        get: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        getAllByUserId: jest.fn(),
        analyzeWordCount: jest.fn(),
        analyzeCharacterCount: jest.fn(),
        analyzeSentenceCount: jest.fn(),
        analyzeParagraphCount: jest.fn(),
        findLongestWordsInParagraphs: jest.fn(),
        getFullAnalysisReport: jest.fn(),
    };

    const mockTextId = 'ba1f4f6a-c986-433c-87e6-1a215ce436fa';
    const mockUserId = 'user-123';
    const mockRequestUser = { user: { userId: mockUserId } };

    beforeAll(() => {
        useContainer(Container);
        Container.set(TextService, mockTextService);
        Container.set(AppLogger, new AppLogger());
        Container.set(AuthMiddleware, new AuthMiddleware());

        app = createExpressServer({
            controllers: [TextController],
            development: false,
            authorizationChecker: async () => true,
            currentUserChecker: async () => mockRequestUser.user,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /texts', () => {
        it('should create a new text', async () => {
            mockTextService.create.mockResolvedValue({ id: '1' });

            const res = await request(app)
                .post('/texts')
                .send({ content: 'Sample Text' });

            expect(res.status).toBe(201);
            expect(res.body).toEqual({ id: '1' });
            expect(mockTextService.create).toHaveBeenCalledWith('Sample Text', mockUserId);
        });
    });

    describe('GET /texts/:id', () => {
        it('should return the text by id', async () => {
            const text: Text = { id: mockTextId, content: 'Hello', userId: mockUserId } as Text;
            mockTextService.get.mockResolvedValue(text);

            const res = await request(app).get(`/texts/${mockTextId}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(expect.objectContaining({ id: mockTextId, content: 'Hello' }));
            expect(mockTextService.get).toHaveBeenCalledWith(mockTextId, mockUserId);
        });
    });

    describe('PUT /texts/:id', () => {
        it('should update a text', async () => {
            mockTextService.update.mockResolvedValue(undefined);

            const res = await request(app)
                .put(`/texts/${mockTextId}`)
                .send({ content: 'Updated Text' });

            expect(res.status).toBe(204);
            expect(mockTextService.update).toHaveBeenCalledWith(mockTextId, 'Updated Text', mockUserId);
        });
    });

    describe('DELETE /texts/:id', () => {
        it('should delete a text', async () => {
            mockTextService.delete.mockResolvedValue(undefined);

            const res = await request(app).delete(`/texts/${mockTextId}`);

            expect(res.status).toBe(204);
            expect(mockTextService.delete).toHaveBeenCalledWith(mockTextId, mockUserId);
        });
    });

    describe('GET /texts', () => {
        it('should return all texts for user', async () => {
            const texts: Text[] = [
                { id: '1', content: 'One', userId: mockUserId } as Text,
                { id: '2', content: 'Two', userId: mockUserId } as Text,
            ];
            mockTextService.getAllByUserId.mockResolvedValue(texts);

            const res = await request(app).get('/texts');

            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(mockTextService.getAllByUserId).toHaveBeenCalledWith(mockUserId);
        });
    });

    describe('GET /texts/:id/word-count', () => {
        it('should return word count of a text', async () => {
            mockTextService.analyzeWordCount = jest.fn().mockResolvedValue(123);

            const res = await request(app).get(`/texts/${mockTextId}/word-count`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ wordCount: 123 });
            expect(mockTextService.analyzeWordCount).toHaveBeenCalledWith(mockTextId, mockUserId);
        });
    });

    describe('GET /texts/:id/character-count', () => {
        it('should return character count of a text', async () => {
            mockTextService.analyzeCharacterCount = jest.fn().mockResolvedValue(456);

            const res = await request(app).get(`/texts/${mockTextId}/character-count`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ characterCount: 456 });
            expect(mockTextService.analyzeCharacterCount).toHaveBeenCalledWith(mockTextId, mockUserId);
        });
    });

    describe('GET /texts/:id/sentence-count', () => {
        it('should return sentence count of a text', async () => {
            mockTextService.analyzeSentenceCount = jest.fn().mockResolvedValue(7);

            const res = await request(app).get(`/texts/${mockTextId}/sentence-count`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ sentenceCount: 7 });
            expect(mockTextService.analyzeSentenceCount).toHaveBeenCalledWith(mockTextId, mockUserId);
        });
    });

    describe('GET /texts/:id/paragraph-count', () => {
        it('should return paragraph count of a text', async () => {
            mockTextService.analyzeParagraphCount = jest.fn().mockResolvedValue(3);

            const res = await request(app).get(`/texts/${mockTextId}/paragraph-count`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ paragraphCount: 3 });
            expect(mockTextService.analyzeParagraphCount).toHaveBeenCalledWith(mockTextId, mockUserId);
        });
    });

    describe('GET /texts/:id/longest-words', () => {
        it('should return longest words grouped by paragraph', async () => {
            const mockParagraphs = [
                { paragraph: 1, longestWords: ['extraordinary', 'phenomenon'] },
                { paragraph: 2, longestWords: ['communication'] },
            ];
            mockTextService.findLongestWordsInParagraphs = jest.fn().mockResolvedValue(mockParagraphs);

            const res = await request(app).get(`/texts/${mockTextId}/longest-words`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                paragraphs: [
                    { paragraph: 1, longestWords: ['extraordinary', 'phenomenon'] },
                    { paragraph: 2, longestWords: ['communication'] },
                ],
            });
            expect(mockTextService.findLongestWordsInParagraphs).toHaveBeenCalledWith(mockTextId, mockUserId);
        });
    });

    describe('GET /texts/:id/analysis-report', () => {
        it('should return full analysis report', async () => {
            const mockReport = {
                wordCount: 10,
                characterCount: 50,
                sentenceCount: 3,
                paragraphCount: 2,
                longestWords: [
                    { paragraph: 1, longestWords: ['extraordinary'] },
                    { paragraph: 2, longestWords: ['communication'] },
                ]
            };

            mockTextService.getFullAnalysisReport = jest.fn().mockResolvedValue(mockReport);

            const res = await request(app).get(`/texts/${mockTextId}/analysis-report`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockReport);
            expect(mockTextService.getFullAnalysisReport).toHaveBeenCalledWith(mockTextId, mockUserId);
        });
    });
});

