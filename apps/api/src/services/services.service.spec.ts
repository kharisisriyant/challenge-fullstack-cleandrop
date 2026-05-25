import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ServicesService } from './services.service';
import { DrizzleService } from '../drizzle/drizzle.service';

const sampleService = {
  id: 'svc-1',
  name: 'Standard Clean',
  description: 'Routine clean',
  category: 'Residential',
  company: 'Acme',
  status: 'active',
  duration: 90,
  basePrice: 80,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const makeDb = (overrides: Partial<typeof mockDb> = {}) => ({ ...mockDb, ...overrides });

const mockDb = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockResolvedValue([sampleService]),
  offset: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockResolvedValue([sampleService]),
  returning: jest.fn().mockResolvedValue([sampleService]),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
};

const mockDrizzle = { db: mockDb };

describe('ServicesService', () => {
  let service: ServicesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        { provide: DrizzleService, useValue: mockDrizzle },
      ],
    }).compile();
    service = module.get<ServicesService>(ServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findOne returns service when found', async () => {
    mockDb.limit.mockResolvedValueOnce([sampleService]);
    const result = await service.findOne('svc-1');
    expect(result.id).toBe('svc-1');
  });

  it('findOne throws NotFoundException when not found', async () => {
    mockDb.limit.mockResolvedValueOnce([]);
    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });
});
