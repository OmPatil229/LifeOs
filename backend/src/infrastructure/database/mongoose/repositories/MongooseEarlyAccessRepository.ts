import { EarlyAccessModel } from '../schemas/EarlyAccess.js';
import { IEarlyAccessRepository, EarlyAccessRequest } from '../../../../domain/repositories/IEarlyAccessRepository.js';

export class MongooseEarlyAccessRepository implements IEarlyAccessRepository {
  async create(data: EarlyAccessRequest): Promise<void> {
    await EarlyAccessModel.create(data);
  }

  async findByEmail(email: string): Promise<boolean> {
    const found = await EarlyAccessModel.findOne({ email });
    return !!found;
  }

  async getCount(): Promise<number> {
    return await EarlyAccessModel.countDocuments();
  }
}
