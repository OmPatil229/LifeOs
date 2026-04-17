import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUserRepository } from '../domain/repositories/IUserRepository.js';
import { User } from '../domain/entities/User.js';

export class AuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  async register(name: string, email: string, passwordPlain: string): Promise<string> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(passwordPlain, 10);
    const user = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      timezone: 'UTC',
      createdAt: new Date()
    });

    return this.generateToken(user);
  }

  async login(email: string, passwordPlain: string): Promise<string> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.password) throw new Error('Invalid credentials');

    const isValid = await bcrypt.compare(passwordPlain, user.password);
    if (!isValid) throw new Error('Invalid credentials');

    return this.generateToken(user);
  }

  async completeOnboarding(userId: string): Promise<void> {
    await this.userRepository.update(userId, { hasOnboardingCompleted: true });
  }

  async findById(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }

  private generateToken(user: User): string {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        hasOnboardingCompleted: user.hasOnboardingCompleted 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );
  }

}
