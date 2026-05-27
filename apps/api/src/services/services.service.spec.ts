import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ServicesService } from './services.service';
import { DrizzleService } from '../drizzle/drizzle.service';
import { ServiceCategory, ServiceStatus, SortOrder } from './services.types';

const sampleCompany = {
  id: 'co-1',
  name: 'Acme',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const sampleService = {
  id: 'svc-1',
  name: 'Standard Clean',
  description: 'Routine clean',
  category: 'Residential',
  companyId: 'co-1',
  status: 'active',
  duration: 90,
  basePrice: 80,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const sampleJoinedRow = { services: sampleService, companies: sampleCompany };

type Chain = Record<string, jest.Mock> & { __resolve: (v: any) => void };

function makeChain(): Chain {
  const chain: any = {};
  const methods = ['from', 'innerJoin', 'where', 'orderBy', 'limit', 'offset', 'values', 'returning', 'set'];
  methods.forEach((m) => {
    chain[m] = jest.fn().mockReturnValue(chain);
  });
  let pendingResolve: any;
  chain.then = (onFulfilled: any, onRejected: any) =>
    new Promise((res, rej) => {
      pendingResolve = (v: any) => res(v);
      chain.__resolve = (v: any) => res(v);
    }).then(onFulfilled, onRejected);
  return chain;
}

function makeMockDb() {
  return {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

describe('ServicesService', () => {
  let mockDb: ReturnType<typeof makeMockDb>;
  let service: ServicesService;

  beforeEach(async () => {
    mockDb = makeMockDb();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        { provide: DrizzleService, useValue: { db: mockDb } },
      ],
    }).compile();
    service = module.get<ServicesService>(ServicesService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('returns service with company when row found', async () => {
      // chain: select().from().innerJoin().where().limit() resolves to [row]
      const chain: any = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([sampleJoinedRow]),
      };
      mockDb.select.mockReturnValue(chain);

      const result = await service.findOne('svc-1');
      expect(result.id).toBe('svc-1');
      expect(result.company.id).toBe('co-1');
      expect(result.company.name).toBe('Acme');
    });

    it('throws NotFoundException when no row', async () => {
      const chain: any = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValue(chain);

      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    function chainForRows(rows: any[]) {
      const chain: any = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockResolvedValue(rows),
      };
      return chain;
    }
    function chainForCount(count: number) {
      const chain: any = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([{ count }]),
      };
      return chain;
    }

    it('returns paginated items + total with defaults (page=1, limit=6)', async () => {
      const rowsChain = chainForRows([sampleJoinedRow]);
      const countChain = chainForCount(1);
      mockDb.select.mockReturnValueOnce(rowsChain).mockReturnValueOnce(countChain);

      const result = await service.findAll({});
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(rowsChain.limit).toHaveBeenCalledWith(6);
      expect(rowsChain.offset).toHaveBeenCalledWith(0);
    });

    it('applies pagination: page=3, limit=10 → offset=20', async () => {
      const rowsChain = chainForRows([]);
      const countChain = chainForCount(0);
      mockDb.select.mockReturnValueOnce(rowsChain).mockReturnValueOnce(countChain);

      await service.findAll({ pagination: { page: 3, limit: 10 } });
      expect(rowsChain.limit).toHaveBeenCalledWith(10);
      expect(rowsChain.offset).toHaveBeenCalledWith(20);
    });

    it('falls back to default sort column when sortBy is unknown', async () => {
      const rowsChain = chainForRows([]);
      const countChain = chainForCount(0);
      mockDb.select.mockReturnValueOnce(rowsChain).mockReturnValueOnce(countChain);

      await service.findAll({ sort: { sortBy: 'definitely-not-a-column', sortOrder: SortOrder.asc } });
      expect(rowsChain.orderBy).toHaveBeenCalledTimes(1);
    });

    it('returns 0 total when count row is missing', async () => {
      const rowsChain = chainForRows([]);
      const countChain: any = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValueOnce(rowsChain).mockReturnValueOnce(countChain);

      const result = await service.findAll({});
      expect(result.total).toBe(0);
    });

    it('shapes joined rows into { ...service, company }', async () => {
      const rowsChain = chainForRows([sampleJoinedRow]);
      const countChain = chainForCount(1);
      mockDb.select.mockReturnValueOnce(rowsChain).mockReturnValueOnce(countChain);

      const result = await service.findAll({});
      expect(result.items[0]).toMatchObject({
        id: 'svc-1',
        name: 'Standard Clean',
        company: { id: 'co-1', name: 'Acme' },
      });
    });
  });

  describe('getStats', () => {
    it('returns aggregate counts and rounded avg', async () => {
      const chain: any = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([{ total: 5, active: 3, drafts: 1, avgBasePrice: 92 }]),
      };
      mockDb.select.mockReturnValue(chain);

      const stats = await service.getStats();
      expect(stats).toEqual({ total: 5, active: 3, drafts: 1, avgBasePrice: 92 });
    });

    it('defaults all fields to 0 when no row returned', async () => {
      const chain: any = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValue(chain);

      const stats = await service.getStats();
      expect(stats).toEqual({ total: 0, active: 0, drafts: 0, avgBasePrice: 0 });
    });
  });

  describe('create', () => {
    it('throws NotFoundException when company does not exist', async () => {
      // assertCompanyExists: select().from().where().limit(1) → []
      const companyCheck: any = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValue(companyCheck);

      await expect(
        service.create({
          name: 'X',
          category: ServiceCategory.Residential,
          companyId: 'missing',
          duration: 60,
          basePrice: 50,
        }),
      ).rejects.toThrow(NotFoundException);
      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('inserts with defaults (description="", status="draft") then re-reads via findOne', async () => {
      const companyCheck: any = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{ id: 'co-1' }]),
      };
      // findOne after create
      const findOneChain: any = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([sampleJoinedRow]),
      };
      mockDb.select.mockReturnValueOnce(companyCheck).mockReturnValueOnce(findOneChain);

      const insertChain: any = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ id: 'svc-1' }]),
      };
      mockDb.insert.mockReturnValue(insertChain);

      const result = await service.create({
        name: 'Standard Clean',
        category: ServiceCategory.Residential,
        companyId: 'co-1',
        duration: 90,
        basePrice: 80,
      });

      expect(insertChain.values).toHaveBeenCalledWith(
        expect.objectContaining({ description: '', status: 'draft' }),
      );
      expect(result.id).toBe('svc-1');
    });

    it('respects explicit status and description', async () => {
      const companyCheck: any = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{ id: 'co-1' }]),
      };
      const findOneChain: any = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([sampleJoinedRow]),
      };
      mockDb.select.mockReturnValueOnce(companyCheck).mockReturnValueOnce(findOneChain);

      const insertChain: any = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ id: 'svc-1' }]),
      };
      mockDb.insert.mockReturnValue(insertChain);

      await service.create({
        name: 'Deep Clean',
        description: 'Thorough',
        category: ServiceCategory.Commercial,
        companyId: 'co-1',
        status: ServiceStatus.active,
        duration: 120,
        basePrice: 200,
      });

      expect(insertChain.values).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Thorough', status: 'active', category: 'Commercial' }),
      );
    });
  });

  describe('update', () => {
    it('throws NotFoundException when service does not exist', async () => {
      const notFound: any = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValue(notFound);

      await expect(service.update('svc-1', { name: 'New' })).rejects.toThrow(NotFoundException);
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it('validates new companyId when changing it', async () => {
      const findOneOk: any = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([sampleJoinedRow]),
      };
      const companyMissing: any = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValueOnce(findOneOk).mockReturnValueOnce(companyMissing);

      await expect(service.update('svc-1', { companyId: 'missing' })).rejects.toThrow(NotFoundException);
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it('applies update with updatedAt and returns refreshed row', async () => {
      const findOneA: any = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([sampleJoinedRow]),
      };
      const findOneB: any = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([sampleJoinedRow]),
      };
      mockDb.select.mockReturnValueOnce(findOneA).mockReturnValueOnce(findOneB);

      const updateChain: any = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(undefined),
      };
      mockDb.update.mockReturnValue(updateChain);

      const result = await service.update('svc-1', { name: 'Renamed' });
      expect(updateChain.set).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Renamed', updatedAt: expect.any(Date) }),
      );
      expect(result.id).toBe('svc-1');
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when service does not exist', async () => {
      const notFound: any = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValue(notFound);

      await expect(service.remove('svc-1')).rejects.toThrow(NotFoundException);
      expect(mockDb.delete).not.toHaveBeenCalled();
    });

    it('returns true after deleting an existing service', async () => {
      const findOneOk: any = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([sampleJoinedRow]),
      };
      mockDb.select.mockReturnValue(findOneOk);

      const deleteChain: any = {
        where: jest.fn().mockResolvedValue(undefined),
      };
      mockDb.delete.mockReturnValue(deleteChain);

      await expect(service.remove('svc-1')).resolves.toBe(true);
      expect(deleteChain.where).toHaveBeenCalledTimes(1);
    });
  });
});
