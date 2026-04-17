import { IEarlyAccessRepository } from '../domain/repositories/IEarlyAccessRepository.js';
import { emailService } from '../infrastructure/services/EmailService.js';

export class EarlyAccessService {
  constructor(private readonly repository: IEarlyAccessRepository) {}

  async joinWaitlist(email: string, source: string = 'landing_page') {
    const exists = await this.repository.findByEmail(email);
    
    if (exists) {
      return { success: true, alreadyExists: true, message: "You're already on the list! We'll be in touch soon." };
    }

    // 1. Store in database
    await this.repository.create({ email, source });

    // 2. Send email
    // Note: We don't await this if we want fast response, but for reliability we might.
    // Given the requirement "email is right and sent successfully", we should probably await or handle errors.
    await emailService.sendWaitlistConfirmation(email);

    const position = await this.repository.getCount();

    return { 
      success: true, 
      alreadyExists: false, 
      message: "You're in! Welcome to the LifeOS Waitlist.",
      position
    };
  }

  async getCount() {
    const count = await this.repository.getCount();
    return { success: true, count };
  }
}
