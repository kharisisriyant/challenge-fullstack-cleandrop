import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;

    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext<{ req: { user?: { role: string } } }>().req;
    const user = req.user;
    if (!user) throw new ForbiddenException('Not authenticated');
    if (!required.includes(user.role)) throw new ForbiddenException('Insufficient permissions');
    return true;
  }
}
