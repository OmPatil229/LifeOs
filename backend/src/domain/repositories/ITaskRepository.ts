import { Task, TaskStatus } from '../entities/Task.js';

export interface ITaskRepository {
  findById(id: string): Promise<Task | null>;
  findByUserIdAndDate(userId: string, date: string): Promise<Task[]>;
  findByUserIdAndDateRange(userId: string, startDate: string, endDate: string): Promise<Task[]>;
  findIncompleteBeforeDate(userId: string, beforeDate: string): Promise<Task[]>;
  create(task: Partial<Task>): Promise<Task>;
  update(id: string, task: Partial<Task>): Promise<Task | null>;
  delete(id: string): Promise<boolean>;
  updateStatus(id: string, status: TaskStatus): Promise<Task | null>;
  countByUserIdAndDateAndStatus(userId: string, date: string, status: TaskStatus): Promise<number>;
  countTotalByUserIdAndDate(userId: string, date: string): Promise<number>;
  countCarriedForwardByDateRange(userId: string, startDate: string, endDate: string): Promise<number>;
  findByGoalId(goalId: string): Promise<Task[]>;
}
