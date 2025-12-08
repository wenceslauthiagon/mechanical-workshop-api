import { prisma } from '../database/prisma';

// Repositories
import { PrismaOwnerRepository } from '../database/repositories/PrismaOwnerRepository';
import { PrismaPetRepository } from '../database/repositories/PrismaPetRepository';
import { PrismaVaccineRepository } from '../database/repositories/PrismaVaccineRepository';
import { PrismaMedicationRepository } from '../database/repositories/PrismaMedicationRepository';
import { PrismaVeterinaryVisitRepository } from '../database/repositories/PrismaVeterinaryVisitRepository';
import { PrismaReminderRepository } from '../database/repositories/PrismaReminderRepository';
import { PrismaWeightHistoryRepository } from '../database/repositories/PrismaWeightHistoryRepository';
import { PrismaAllergyRepository } from '../database/repositories/PrismaAllergyRepository';
import { AuthRepository } from '../database/repositories/AuthRepository';

// Services
import { AuthService } from '@shared/services/AuthService';

// Use Cases - Owner
import { RegisterOwnerUseCase } from '@application/use-cases/owner/RegisterOwnerUseCase';
import { GetOwnerByIdUseCase } from '@application/use-cases/owner/GetOwnerByIdUseCase';

// Use Cases - Pet
import { RegisterPetUseCase } from '@application/use-cases/pet/RegisterPetUseCase';
import { GetPetByIdUseCase } from '@application/use-cases/pet/GetPetByIdUseCase';
import { ListPetsByOwnerUseCase } from '@application/use-cases/pet/ListPetsByOwnerUseCase';
import { UpdatePetUseCase } from '@application/use-cases/pet/UpdatePetUseCase';
import { DeletePetUseCase } from '@application/use-cases/pet/DeletePetUseCase';

// Use Cases - Vaccine
import { RecordVaccineUseCase } from '@application/use-cases/vaccine/RecordVaccineUseCase';
import { ListVaccinesByPetUseCase } from '@application/use-cases/vaccine/ListVaccinesByPetUseCase';
import { UpdateVaccineUseCase } from '@application/use-cases/vaccine/UpdateVaccineUseCase';

// Use Cases - Medication
import { ScheduleMedicationUseCase } from '@application/use-cases/medication/ScheduleMedicationUseCase';
import { ListMedicationsByPetUseCase } from '@application/use-cases/medication/ListMedicationsByPetUseCase';
import { GetActiveMedicationsUseCase } from '@application/use-cases/medication/GetActiveMedicationsUseCase';

// Use Cases - Veterinary Visit
import { RecordVeterinaryVisitUseCase } from '@application/use-cases/veterinary-visit/RecordVeterinaryVisitUseCase';
import { ListVeterinaryVisitsByPetUseCase } from '@application/use-cases/veterinary-visit/ListVeterinaryVisitsByPetUseCase';

// Use Cases - Reminder
import { CreateReminderUseCase } from '@application/use-cases/reminder/CreateReminderUseCase';
import { GetUpcomingRemindersUseCase } from '@application/use-cases/reminder/GetUpcomingRemindersUseCase';
import { GetOverdueRemindersUseCase } from '@application/use-cases/reminder/GetOverdueRemindersUseCase';
import { ListRemindersByPetUseCase } from '@application/use-cases/reminder/ListRemindersByPetUseCase';
import { CompleteReminderUseCase } from '@application/use-cases/reminder/CompleteReminderUseCase';
import { CreateVaccineReminderUseCase } from '@application/use-cases/reminder/CreateVaccineReminderUseCase';
import { CreateMedicationReminderUseCase } from '@application/use-cases/reminder/CreateMedicationReminderUseCase';
import { ScheduleWalkRemindersUseCase } from '@application/use-cases/reminder/ScheduleWalkRemindersUseCase';
import { GetPetRemindersWithFiltersUseCase } from '@application/use-cases/reminder/GetPetRemindersWithFiltersUseCase';

// Use Cases - Weight History
import { RecordWeightUseCase } from '@application/use-cases/weight/RecordWeightUseCase';
import { GetWeightHistoryUseCase } from '@application/use-cases/weight/GetWeightHistoryUseCase';
import { GetLatestWeightUseCase } from '@application/use-cases/weight/GetLatestWeightUseCase';

// Use Cases - Allergy
import { RegisterAllergyUseCase } from '@application/use-cases/allergy/RegisterAllergyUseCase';
import { ListAllergiesByPetUseCase } from '@application/use-cases/allergy/ListAllergiesByPetUseCase';
import { GetSevereAllergiesUseCase } from '@application/use-cases/allergy/GetSevereAllergiesUseCase';

// Use Cases - Auth
import { RegisterUseCase } from '@application/use-cases/auth/RegisterUseCase';
import { LoginUseCase } from '@application/use-cases/auth/LoginUseCase';

// Controllers
import { OwnerController } from './controllers/OwnerController';
import { PetController } from './controllers/PetController';
import { VaccineController } from './controllers/VaccineController';
import { MedicationController } from './controllers/MedicationController';
import { VeterinaryVisitController } from './controllers/VeterinaryVisitController';
import { ReminderController } from './controllers/ReminderController';
import { WeightHistoryController } from './controllers/WeightHistoryController';
import { AllergyController } from './controllers/AllergyController';
import { AuthController } from './controllers/AuthController';

class DependencyContainer {
  // Repositories
  public ownerRepository = new PrismaOwnerRepository(prisma);
  public petRepository = new PrismaPetRepository(prisma);
  public vaccineRepository = new PrismaVaccineRepository(prisma);
  public medicationRepository = new PrismaMedicationRepository(prisma);
  public veterinaryVisitRepository = new PrismaVeterinaryVisitRepository(prisma);
  public reminderRepository = new PrismaReminderRepository(prisma);
  public weightHistoryRepository = new PrismaWeightHistoryRepository(prisma);
  public allergyRepository = new PrismaAllergyRepository(prisma);
  public authRepository = new AuthRepository();

  // Services
  public authService = new AuthService();

  // Use Cases - Owner
  public registerOwnerUseCase = new RegisterOwnerUseCase(this.ownerRepository);
  public getOwnerByIdUseCase = new GetOwnerByIdUseCase(this.ownerRepository);

  // Use Cases - Pet
  public registerPetUseCase = new RegisterPetUseCase(this.petRepository, this.ownerRepository);
  public getPetByIdUseCase = new GetPetByIdUseCase(this.petRepository);
  public listPetsByOwnerUseCase = new ListPetsByOwnerUseCase(this.petRepository);
  public updatePetUseCase = new UpdatePetUseCase(this.petRepository);
  public deletePetUseCase = new DeletePetUseCase(this.petRepository);

  // Use Cases - Vaccine
  public recordVaccineUseCase = new RecordVaccineUseCase(
    this.vaccineRepository,
    this.petRepository,
  );
  public listVaccinesByPetUseCase = new ListVaccinesByPetUseCase(this.vaccineRepository);
  public updateVaccineUseCase = new UpdateVaccineUseCase(this.vaccineRepository);

  // Use Cases - Medication
  public scheduleMedicationUseCase = new ScheduleMedicationUseCase(
    this.medicationRepository,
    this.petRepository,
  );
  public listMedicationsByPetUseCase = new ListMedicationsByPetUseCase(this.medicationRepository);
  public getActiveMedicationsUseCase = new GetActiveMedicationsUseCase(this.medicationRepository);

  // Use Cases - Veterinary Visit
  public recordVeterinaryVisitUseCase = new RecordVeterinaryVisitUseCase(
    this.veterinaryVisitRepository,
    this.petRepository,
  );
  public listVeterinaryVisitsByPetUseCase = new ListVeterinaryVisitsByPetUseCase(
    this.veterinaryVisitRepository,
  );

  // Use Cases - Reminder
  public createReminderUseCase = new CreateReminderUseCase(
    this.reminderRepository,
    this.petRepository,
  );
  public getUpcomingRemindersUseCase = new GetUpcomingRemindersUseCase(this.reminderRepository);
  public getOverdueRemindersUseCase = new GetOverdueRemindersUseCase(this.reminderRepository);
  public listRemindersByPetUseCase = new ListRemindersByPetUseCase(this.reminderRepository);
  public completeReminderUseCase = new CompleteReminderUseCase(this.reminderRepository);
  public createVaccineReminderUseCase = new CreateVaccineReminderUseCase(
    this.reminderRepository,
    this.vaccineRepository,
  );
  public createMedicationReminderUseCase = new CreateMedicationReminderUseCase(
    this.reminderRepository,
    this.medicationRepository,
  );
  public scheduleWalkRemindersUseCase = new ScheduleWalkRemindersUseCase(
    this.reminderRepository,
    this.petRepository,
  );
  public getPetRemindersWithFiltersUseCase = new GetPetRemindersWithFiltersUseCase(
    this.reminderRepository,
  );

  // Use Cases - Weight History
  public recordWeightUseCase = new RecordWeightUseCase(
    this.weightHistoryRepository,
    this.petRepository,
  );
  public getWeightHistoryUseCase = new GetWeightHistoryUseCase(this.weightHistoryRepository);
  public getLatestWeightUseCase = new GetLatestWeightUseCase(this.weightHistoryRepository);

  // Use Cases - Allergy
  public registerAllergyUseCase = new RegisterAllergyUseCase(
    this.allergyRepository,
    this.petRepository,
  );
  public listAllergiesByPetUseCase = new ListAllergiesByPetUseCase(this.allergyRepository);
  public getSevereAllergiesUseCase = new GetSevereAllergiesUseCase(this.allergyRepository);

  // Use Cases - Auth
  public registerUseCase = new RegisterUseCase(this.authRepository, this.authService);
  public loginUseCase = new LoginUseCase(this.authRepository, this.authService);

  // Controllers
  public ownerController = new OwnerController(
    this.registerOwnerUseCase,
    this.getOwnerByIdUseCase,
  );

  public petController = new PetController(
    this.registerPetUseCase,
    this.getPetByIdUseCase,
    this.listPetsByOwnerUseCase,
    this.updatePetUseCase,
    this.deletePetUseCase,
  );

  public vaccineController = new VaccineController(
    this.recordVaccineUseCase,
    this.listVaccinesByPetUseCase,
    this.updateVaccineUseCase,
  );

  public medicationController = new MedicationController(
    this.scheduleMedicationUseCase,
    this.listMedicationsByPetUseCase,
    this.getActiveMedicationsUseCase,
  );

  public veterinaryVisitController = new VeterinaryVisitController(
    this.recordVeterinaryVisitUseCase,
    this.listVeterinaryVisitsByPetUseCase,
  );

  public reminderController = new ReminderController(
    this.createReminderUseCase,
    this.getUpcomingRemindersUseCase,
    this.getOverdueRemindersUseCase,
    this.listRemindersByPetUseCase,
    this.completeReminderUseCase,
    this.createVaccineReminderUseCase,
    this.createMedicationReminderUseCase,
    this.scheduleWalkRemindersUseCase,
    this.getPetRemindersWithFiltersUseCase,
  );

  public weightHistoryController = new WeightHistoryController(
    this.recordWeightUseCase,
    this.getWeightHistoryUseCase,
    this.getLatestWeightUseCase,
  );

  public allergyController = new AllergyController(
    this.registerAllergyUseCase,
    this.listAllergiesByPetUseCase,
    this.getSevereAllergiesUseCase,
  );

  public authController = new AuthController(this.registerUseCase, this.loginUseCase);
}

export const container = new DependencyContainer();
