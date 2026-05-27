import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { DrizzleService } from '../drizzle/drizzle.service';

const PLAINTEXT = 'admin123';
const PASSWORD_HASH = bcrypt.hashSync(PLAINTEXT, 4);

const mockUser = {
  id: 'user-1',
  email: 'admin@cleandrop.com',
  name: 'Dev Admin',
  role: 'admin',
  password: PASSWORD_HASH,
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

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockDrizzle.db.limit.mockResolvedValue([mockUser]);
    mockJwt.sign.mockReturnValue('signed-token');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DrizzleService, useValue: mockDrizzle },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  it('returns token + user fields on valid credentials', async () => {
    const result = await service.login('admin@cleandrop.com', PLAINTEXT);
    expect(result).toEqual({
      token: 'signed-token',
      userId: 'user-1',
      email: 'admin@cleandrop.com',
      name: 'Dev Admin',
      role: 'admin',
    });
  });

  it('signs JWT with sub/email/role payload', async () => {
    await service.login('admin@cleandrop.com', PLAINTEXT);
    expect(mockJwt.sign).toHaveBeenCalledWith({
      sub: 'user-1',
      email: 'admin@cleandrop.com',
      role: 'admin',
    });
  });

  it('throws UnauthorizedException on wrong password (no token signed)', async () => {
    await expect(service.login('admin@cleandrop.com', 'wrong')).rejects.toThrow(UnauthorizedException);
    expect(mockJwt.sign).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedException when user not found (no token signed)', async () => {
    mockDrizzle.db.limit.mockResolvedValueOnce([]);
    await expect(service.login('nobody@cleandrop.com', PLAINTEXT)).rejects.toThrow(UnauthorizedException);
    expect(mockJwt.sign).not.toHaveBeenCalled();
  });
});
