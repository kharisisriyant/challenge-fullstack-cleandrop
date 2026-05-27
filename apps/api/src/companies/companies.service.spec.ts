import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { DrizzleService } from '../drizzle/drizzle.service';

const sampleCompany = {
  id: 'co-1',
  name: 'Acme',
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeMockDb() {
  return {
    select: jest.fn(),
    insert: jest.fn(),
  };
}

describe('CompaniesService', () => {
  let mockDb: ReturnType<typeof makeMockDb>;
  let service: CompaniesService;

  beforeEach(async () => {
    mockDb = makeMockDb();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        { provide: DrizzleService, useValue: { db: mockDb } },
      ],
    }).compile();
    service = module.get<CompaniesService>(CompaniesService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns rows ordered by name', async () => {
      const rows = [sampleCompany, { ...sampleCompany, id: 'co-2', name: 'Beta' }];
      const chain: any = {
        from: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue(rows),
      };
      mockDb.select.mockReturnValue(chain);

      const result = await service.findAll();
      expect(result).toHaveLength(2);
      expect(chain.orderBy).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('returns company when found', async () => {
      const chain: any = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([sampleCompany]),
      };
      mockDb.select.mockReturnValue(chain);

      const result = await service.findOne('co-1');
      expect(result.id).toBe('co-1');
    });

    it('throws NotFoundException when missing', async () => {
      const chain: any = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValue(chain);

      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('throws ConflictException when name is whitespace-only', async () => {
      await expect(service.create({ name: '   ' })).rejects.toThrow(ConflictException);
      expect(mockDb.select).not.toHaveBeenCalled();
      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('throws ConflictException when name already exists (case-sensitive trim)', async () => {
      const chain: any = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([sampleCompany]),
      };
      mockDb.select.mockReturnValue(chain);

      await expect(service.create({ name: '  Acme  ' })).rejects.toThrow(ConflictException);
      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('inserts trimmed name and returns created row', async () => {
      const existsChain: any = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValue(existsChain);

      const insertChain: any = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([sampleCompany]),
      };
      mockDb.insert.mockReturnValue(insertChain);

      const result = await service.create({ name: '  Acme  ' });
      expect(insertChain.values).toHaveBeenCalledWith({ name: 'Acme' });
      expect(result).toEqual(sampleCompany);
    });
  });
});
