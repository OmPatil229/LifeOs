import { Session } from '../entities/Session.js';

export interface ISessionRepository {
  findById(id: string): Promise<Session | null>;
  findByUserId(userId: string): Promise<Session[]>;
  findActiveByUserId(userId: string): Promise<Session | null>;
  create(session: Partial<Session>): Promise<Session>;
  update(id: string, session: Partial<Session>): Promise<Session | null>;
  delete(id: string): Promise<boolean>;
}
