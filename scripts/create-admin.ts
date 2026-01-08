import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { APP_CONSTANTS, ENV_KEYS } from '../src/shared/constants/app.constants';
import { ErrorHandlerService } from '../src/shared/services/error-handler.service';
import { HttpStatus } from '@nestjs/common';

const prisma = new PrismaClient();
const errorHandler = new ErrorHandlerService();

async function createAdminUser() {
  try {
    // Check if an admin user already exists.
    const existingAdmin = await prisma.user.findFirst({
      where: { role: UserRole.ADMIN },
    });

    if (existingAdmin) {
      console.log('Usuário admin já existe:', existingAdmin.username);
      return;
    }

    // Get environment configurations
    const adminUsername =
      process.env[ENV_KEYS.ADMIN_USERNAME] || APP_CONSTANTS.DEV_ADMIN.USERNAME;
    const adminEmail =
      process.env[ENV_KEYS.ADMIN_EMAIL] || APP_CONSTANTS.DEV_ADMIN.EMAIL;
    const adminPassword = process.env[ENV_KEYS.ADMIN_PASSWORD];

    if (!adminPassword) {
      return errorHandler.generateException(
        `${ENV_KEYS.ADMIN_PASSWORD} environment variable is required`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(
      adminPassword,
      APP_CONSTANTS.PASSWORD_HASH_ROUNDS,
    );

    await prisma.user.create({
      data: {
        username: adminUsername,
        email: adminEmail,
        passwordHash: hashedPassword,
        role: UserRole.ADMIN,
      },
    });
  } catch (error) {
    errorHandler.handleError(error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
