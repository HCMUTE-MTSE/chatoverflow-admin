import { Test, TestingModule } from '@nestjs/testing';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { getModelToken } from '@nestjs/mongoose';
import { Question } from './entities/question.entity';

describe('QuestionsController', () => {
  let controller: QuestionsController;
  let service: QuestionsService;

  const mockQuestionModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    aggregate: jest.fn(),
    countDocuments: jest.fn(),
  };

  const mockQuestionsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    incrementViews: jest.fn(),
    getPopularQuestions: jest.fn(),
    getRecentQuestions: jest.fn(),
    getQuestionsByTag: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionsController],
      providers: [
        {
          provide: QuestionsService,
          useValue: mockQuestionsService,
        },
        {
          provide: getModelToken(Question.name),
          useValue: mockQuestionModel,
        },
      ],
    }).compile();

    controller = module.get<QuestionsController>(QuestionsController);
    service = module.get<QuestionsService>(QuestionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated questions', async () => {
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      };

      mockQuestionsService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll({});
      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('getPopular', () => {
    it('should return popular questions with default limit', async () => {
      const mockQuestions = [];
      mockQuestionsService.getPopularQuestions.mockResolvedValue(mockQuestions);

      const result = await controller.getPopular();
      expect(result).toEqual(mockQuestions);
      expect(service.getPopularQuestions).toHaveBeenCalledWith(10);
    });
  });

  describe('findOne', () => {
    it('should return a question by id', async () => {
      const mockQuestion = { _id: '123', title: 'Test Question' };
      mockQuestionsService.findOne.mockResolvedValue(mockQuestion);

      const result = await controller.findOne('123');
      expect(result).toEqual(mockQuestion);
      expect(service.findOne).toHaveBeenCalledWith('123');
    });
  });
});
