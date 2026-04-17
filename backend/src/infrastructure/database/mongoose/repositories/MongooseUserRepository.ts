import { UserModel } from '../schemas/User.js';
import { User } from '../../../../domain/entities/User.js';
import { IUserRepository } from '../../../../domain/repositories/IUserRepository.js';

export class MongooseUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async create(user: Partial<User>): Promise<User> {
    const doc = await UserModel.create(user);
    return this.mapToEntity(doc.toObject());
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    const doc = await UserModel.findByIdAndUpdate(id, user, { new: true }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }


  private mapToEntity(doc: any): User {
    const { _id, ...rest } = doc;
    return { id: _id.toString(), ...rest };
  }
}
