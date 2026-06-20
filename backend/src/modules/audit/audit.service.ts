import { Injectable, Logger } from '@nestjs/common';

export interface AuditEntry {
  action: string;
  userId: string;
  email: string;
  details?: Record<string, any>;
  ip?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger('Audit');

  log(entry: AuditEntry): void {
    const { action, userId, email, details, ip } = entry;
    this.logger.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        action,
        userId,
        email,
        ip,
        ...(details ? { details } : {}),
      }),
    );
  }
}
