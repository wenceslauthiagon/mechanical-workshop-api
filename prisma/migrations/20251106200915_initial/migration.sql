-- CreateTable
CREATE TABLE `owners` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `owners_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pets` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('DOG', 'CAT') NOT NULL,
    `breed` VARCHAR(191) NOT NULL,
    `gender` ENUM('MALE', 'FEMALE') NOT NULL,
    `birthDate` DATETIME(3) NOT NULL,
    `weight` DOUBLE NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `microchipNumber` VARCHAR(191) NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vaccines` (
    `id` VARCHAR(191) NOT NULL,
    `petId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `applicationDate` DATETIME(3) NULL,
    `scheduledDate` DATETIME(3) NOT NULL,
    `nextDoseDate` DATETIME(3) NULL,
    `veterinarianName` VARCHAR(191) NULL,
    `clinicName` VARCHAR(191) NULL,
    `batchNumber` VARCHAR(191) NULL,
    `status` ENUM('SCHEDULED', 'APPLIED', 'OVERDUE', 'CANCELED') NOT NULL,
    `observations` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medications` (
    `id` VARCHAR(191) NOT NULL,
    `petId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('ANTIBIOTIC', 'ANTI_INFLAMMATORY', 'ANALGESIC', 'ANTIPARASITIC', 'FLEA_TICK_CONTROL', 'DEWORMER', 'HEARTWORM_PREVENTION', 'SUPPLEMENT', 'VACCINE', 'OTHER') NOT NULL,
    `dosage` VARCHAR(191) NOT NULL,
    `frequency` ENUM('ONCE', 'DAILY', 'TWICE_DAILY', 'THREE_TIMES_DAILY', 'WEEKLY', 'MONTHLY', 'AS_NEEDED') NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `prescribedBy` VARCHAR(191) NULL,
    `reason` VARCHAR(191) NOT NULL,
    `instructions` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'COMPLETED', 'SUSPENDED') NOT NULL,
    `observations` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medication_doses` (
    `id` VARCHAR(191) NOT NULL,
    `medicationId` VARCHAR(191) NOT NULL,
    `scheduledTime` DATETIME(3) NOT NULL,
    `administeredTime` DATETIME(3) NULL,
    `administered` BOOLEAN NOT NULL DEFAULT false,
    `observations` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `veterinary_visits` (
    `id` VARCHAR(191) NOT NULL,
    `petId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `type` ENUM('ROUTINE_CHECKUP', 'VACCINATION', 'EMERGENCY', 'SURGERY', 'DENTAL', 'CONSULTATION', 'EXAM', 'OTHER') NOT NULL,
    `veterinarianName` VARCHAR(191) NOT NULL,
    `clinicName` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `diagnosis` VARCHAR(191) NULL,
    `treatment` VARCHAR(191) NULL,
    `prescriptions` VARCHAR(191) NULL,
    `examResults` VARCHAR(191) NULL,
    `cost` DOUBLE NULL,
    `nextVisitDate` DATETIME(3) NULL,
    `observations` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reminders` (
    `id` VARCHAR(191) NOT NULL,
    `petId` VARCHAR(191) NOT NULL,
    `type` ENUM('VACCINE', 'MEDICATION', 'VETERINARY_VISIT', 'DEWORMING', 'FLEA_TICK_TREATMENT', 'WEIGHT_CHECK', 'GROOMING', 'WALK', 'EXERCISE', 'OTHER') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `dueDate` DATETIME(3) NOT NULL,
    `status` ENUM('PENDING', 'SENT', 'COMPLETED', 'CANCELED') NOT NULL,
    `relatedEntityId` VARCHAR(191) NULL,
    `notificationSent` BOOLEAN NOT NULL DEFAULT false,
    `notificationSentAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `weight_history` (
    `id` VARCHAR(191) NOT NULL,
    `petId` VARCHAR(191) NOT NULL,
    `weight` DOUBLE NOT NULL,
    `measurementDate` DATETIME(3) NOT NULL,
    `observations` VARCHAR(191) NULL,
    `recordedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `allergies` (
    `id` VARCHAR(191) NOT NULL,
    `petId` VARCHAR(191) NOT NULL,
    `allergen` VARCHAR(191) NOT NULL,
    `type` ENUM('MEDICATION', 'FOOD', 'ENVIRONMENTAL', 'OTHER') NOT NULL,
    `severity` ENUM('MILD', 'MODERATE', 'SEVERE', 'LIFE_THREATENING') NOT NULL,
    `symptoms` VARCHAR(191) NULL,
    `diagnosedDate` DATETIME(3) NULL,
    `diagnosedBy` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pets` ADD CONSTRAINT `pets_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `owners`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vaccines` ADD CONSTRAINT `vaccines_petId_fkey` FOREIGN KEY (`petId`) REFERENCES `pets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medications` ADD CONSTRAINT `medications_petId_fkey` FOREIGN KEY (`petId`) REFERENCES `pets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medication_doses` ADD CONSTRAINT `medication_doses_medicationId_fkey` FOREIGN KEY (`medicationId`) REFERENCES `medications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `veterinary_visits` ADD CONSTRAINT `veterinary_visits_petId_fkey` FOREIGN KEY (`petId`) REFERENCES `pets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reminders` ADD CONSTRAINT `reminders_petId_fkey` FOREIGN KEY (`petId`) REFERENCES `pets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `weight_history` ADD CONSTRAINT `weight_history_petId_fkey` FOREIGN KEY (`petId`) REFERENCES `pets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `allergies` ADD CONSTRAINT `allergies_petId_fkey` FOREIGN KEY (`petId`) REFERENCES `pets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
