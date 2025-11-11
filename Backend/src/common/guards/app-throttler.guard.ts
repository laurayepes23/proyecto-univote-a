import { Injectable, Logger } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ExecutionContext } from '@nestjs/common';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
    private readonly logger = new Logger(AppThrottlerGuard.name);

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const method: string = req?.method || '';
        const path: string = req?.path || req?.url || '';

        // Always allow CORS preflight
        if (method === 'OPTIONS') {
            return true;
        }

        // Explicitly skip throttling for elections endpoints
        if (path.startsWith('/elections')) {
            return true;
        }

        return super.canActivate(context);
    }
}
