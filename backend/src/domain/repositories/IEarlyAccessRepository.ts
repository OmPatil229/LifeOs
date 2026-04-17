export interface EarlyAccessRequest {
  email: string;
  source?: string;
  timestamp?: Date;
}

export interface IEarlyAccessRepository {
  create(data: EarlyAccessRequest): Promise<void>;
  findByEmail(email: string): Promise<boolean>;
  getCount(): Promise<number>;
}
