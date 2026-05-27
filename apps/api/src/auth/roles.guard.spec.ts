import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { RolesGuard } from './roles.guard';

function makeCtx(user: { role: string } | undefined): ExecutionContext {
  jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
    getContext: () => ({ req: { user } }),
  } as any);
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  beforeEach(() => {
    jest.restoreAllMocks();
    reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector;
    guard = new RolesGuard(reflector);
  });

  it('allows when no @Roles metadata is set', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
    expect(guard.canActivate(makeCtx({ role: 'admin' }))).toBe(true);
  });

  it('throws ForbiddenException when user is not authenticated', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['admin']);
    expect(() => guard.canActivate(makeCtx(undefined))).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when role is not in required list', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['admin']);
    expect(() => guard.canActivate(makeCtx({ role: 'user' }))).toThrow(
      new ForbiddenException('Insufficient permissions'),
    );
  });

  it('allows when user role matches one of required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['admin', 'manager']);
    expect(guard.canActivate(makeCtx({ role: 'manager' }))).toBe(true);
  });
});
