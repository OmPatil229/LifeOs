import { Goal, GoalStatus } from '../entities/Goal.js';

export interface IGoalRepository {
  findById(id: string): Promise<Goal | null>;
  findByUserId(userId: string): Promise<Goal[]>;
  findByUserIdAndType(userId: string, type: 'year' | 'month' | 'week' | 'day'): Promise<Goal[]>;
  create(goal: Partial<Goal>): Promise<Goal>;
  update(id: string, goal: Partial<Goal>): Promise<Goal | null>;
  delete(id: string): Promise<boolean>;
  updateProgress(id: string, progress: number, status: GoalStatus): Promise<Goal | null>;
  findHierarchy(userId: string, date: string): Promise<Goal[]>;
  findByParentId(parentId: string): Promise<Goal[]>;
}

