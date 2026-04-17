import 'dotenv/config';
import { connectDB } from './infrastructure/database/connection.js';
import { createExpressApp } from './presentation/http/app.js';
import { createV1Router } from './presentation/http/routes/v1.js';
import { winstonLogger as logger } from './infrastructure/config/logger.js';

// Repositories (Infrastructure Layer)
import { MongooseUserRepository } from './infrastructure/database/mongoose/repositories/MongooseUserRepository.js';
import { MongooseTaskRepository } from './infrastructure/database/mongoose/repositories/MongooseTaskRepository.js';
import { MongooseHabitRepository } from './infrastructure/database/mongoose/repositories/MongooseHabitRepository.js';
import { MongooseDailyLogRepository } from './infrastructure/database/mongoose/repositories/MongooseDailyLogRepository.js';
import { MongooseInsightRepository } from './infrastructure/database/mongoose/repositories/MongooseInsightRepository.js';
import { MongooseTimeCardRepository } from './infrastructure/database/mongoose/repositories/MongooseTimeCardRepository.js';
import { MongooseJournalEntryRepository } from './infrastructure/database/mongoose/repositories/MongooseJournalEntryRepository.js';
import { MongooseEarlyAccessRepository } from './infrastructure/database/mongoose/repositories/MongooseEarlyAccessRepository.js';

// Services (Application Layer)
import { AuthService } from './application/AuthService.js';
import { DailyLogService } from './application/DailyLogService.js';
import { TaskService } from './application/TaskService.js';
import { HabitService } from './application/HabitService.js';
import { InsightService } from './application/InsightService.js';
import { TimeCardService } from './application/TimeCardService.js';
import { JournalService } from './application/JournalService.js';
import { EarlyAccessService } from './application/EarlyAccessService.js';

// Controllers (Presentation Layer)
import { AuthController } from './presentation/http/controllers/AuthController.js';
import { DashboardController } from './presentation/http/controllers/DashboardController.js';
import { TimelineController } from './presentation/http/controllers/TimelineController.js';
import { TaskController, HabitController } from './presentation/http/controllers/TaskHabitControllers.js';
import { TimeCardController } from './presentation/http/controllers/TimeCardController.js';
import { SessionController } from './presentation/http/controllers/SessionController.js';
import { MongooseSessionRepository } from './infrastructure/database/mongoose/repositories/MongooseSessionRepository.js';
import { SessionService } from './application/SessionService.js';
import { MongooseGoalRepository } from './infrastructure/database/mongoose/repositories/MongooseGoalRepository.js';
import { GoalService } from './application/GoalService.js';
import { GoalController } from './presentation/http/controllers/GoalController.js';
import { JournalController } from './presentation/http/controllers/JournalController.js';
import { EarlyAccessController } from './presentation/http/controllers/EarlyAccessController.js';

/**
 * PRODUCTION BOOTSTRAP — LifeOS Adaptive Behavior Engine.
 * Wires the Clean Architecture layers manually (pure Dependency Injection).
 */
const startServer = async () => {
  // 1. Initialize Infrastructure
  await connectDB();

  // 2. Instantiate Repositories (Ports in Domain)
  const userRepo = new MongooseUserRepository();
  const taskRepo = new MongooseTaskRepository();
  const habitRepo = new MongooseHabitRepository();
  const logRepo = new MongooseDailyLogRepository();
  const insightRepo = new MongooseInsightRepository();
  const timeCardRepo = new MongooseTimeCardRepository();
  const sessionRepo = new MongooseSessionRepository();
  const goalRepo = new MongooseGoalRepository();
  const journalRepo = new MongooseJournalEntryRepository();
  const earlyAccessRepo = new MongooseEarlyAccessRepository();

  // 3. Instantiate Domain Services (Application Logic)
  const dailyLogService = new DailyLogService(logRepo, taskRepo, habitRepo, journalRepo, sessionRepo);
  const authService = new AuthService(userRepo);
  const insightService = new InsightService(insightRepo, taskRepo, habitRepo, logRepo, sessionRepo, goalRepo);
  const timeCardService = new TimeCardService(timeCardRepo, insightService);
  const goalService = new GoalService(goalRepo, taskRepo, habitRepo);
  const taskService = new TaskService(taskRepo, dailyLogService, goalService);
  const habitService = new HabitService(habitRepo, dailyLogService, goalService);
  const sessionService = new SessionService(sessionRepo, taskRepo, goalRepo);
  const journalService = new JournalService(journalRepo, dailyLogService);
  const earlyAccessService = new EarlyAccessService(earlyAccessRepo);

  // 4. Instantiate Controllers (Presentation Logic)
  const authController = new AuthController(authService);
  const dashboardController = new DashboardController(dailyLogService, insightService, goalService);
  const timelineController = new TimelineController(taskService, habitService);
  const taskController = new TaskController(taskService);
  const habitController = new HabitController(habitService);
  const timeCardController = new TimeCardController(timeCardService);
  const sessionController = new SessionController(sessionService);
  const goalController = new GoalController(goalService);
  const journalController = new JournalController(journalService);
  const earlyAccessController = new EarlyAccessController(earlyAccessService);

  // 5. Wire Routes & Start REST Portal
  const router = createV1Router(
    authController,
    dashboardController,
    timelineController,
    taskController,
    habitController,
    timeCardController,
    sessionController,
    goalController,
    journalController,
    earlyAccessController
  );

  const app = createExpressApp(router);
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    logger.info(`=== LifeOS Adaptive Engine Active ===`);
    logger.info(`Port: ${PORT} | Mode: ${process.env.NODE_ENV || 'production'}`);
    logger.info(`Endpoints: http://localhost:${PORT}/api/v1`);
  });
};

startServer().catch(err => {
  logger.error('CRITICAL STARTUP FAILURE', err);
  process.exit(1);
});
