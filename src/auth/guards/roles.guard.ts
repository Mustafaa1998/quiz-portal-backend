import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../roles/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as { role?: string } | undefined;

    if (!user) throw new UnauthorizedException('Missing authenticated user');

    const userRole = (user.role ?? '').toString().toUpperCase();
    const ok = required
      .map(r => r.toString().toUpperCase())
      .includes(userRole);

    if (!ok) {
      throw new ForbiddenException(
        `Insufficient role. Required: ${required.join(', ')}, but you are ${user.role}.`,
      );
    }
    return true;
    }
}
