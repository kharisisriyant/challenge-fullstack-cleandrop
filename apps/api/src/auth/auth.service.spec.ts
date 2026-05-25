import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DrizzleService } from '../drizzle/drizzle.service';

const mockUser = {
  id: 'user-1',
  email: 'admin@cleandrop.com',
  name: 'Dev Admin',
  role: 'admin',
  password: '$2a$10$PLACEHOLDER', // not used directly
  createdAt: new Date(),
};

const mockDrizzle = {
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([mockUser]),
  },
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('signed-token'),
};

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

import bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DrizzleService, useValue: mockDrizzle },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns token on valid credentials', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const result = await service.login('admin@cleandrop.com', 'admin123');
    expect(result.token).toBe('signed-token');
    expect(result.role).toBe('admin');
  });

  it('throws UnauthorizedException on wrong password', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(service.login('admin@cleandrop.com', 'wrong')).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when user not found', async () => {
    mockDrizzle.db.limit.mockResolvedValueOnce([]);
    await expect(service.login('nobody@cleandrop.com', 'any')).rejects.toThrow(UnauthorizedException);
  });
});
