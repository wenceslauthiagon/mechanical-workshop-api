import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { APP_CONSTANTS, ENV_KEYS } from '../src/shared/constants/app.constants';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Verificar se já existe um usuário admin
    const existingAdmin = await prisma.user.findFirst({
      where: { role: UserRole.ADMIN },
    });

    if (existingAdmin) {
      console.log('Usuário admin já existe:', existingAdmin.username);
      return;
    }

    // Obter configurações do ambiente
    const adminUsername =
      process.env[ENV_KEYS.ADMIN_USERNAME] || APP_CONSTANTS.DEV_ADMIN.USERNAME;
    const adminEmail =
      process.env[ENV_KEYS.ADMIN_EMAIL] || APP_CONSTANTS.DEV_ADMIN.EMAIL;
    const adminPassword = process.env[ENV_KEYS.ADMIN_PASSWORD];

    if (!adminPassword) {
      throw new Error(
        `${ENV_KEYS.ADMIN_PASSWORD} environment variable is required`,
      );
    }

    // Criar usuário admin
    const hashedPassword = await bcrypt.hash(
      adminPassword,
      APP_CONSTANTS.PASSWORD_HASH_ROUNDS,
    );

    const admin = await prisma.user.create({
      data: {
        username: adminUsername,
        email: adminEmail,
        passwordHash: hashedPassword,
        role: UserRole.ADMIN,
      },
    });

    console.log('Usuário admin criado com sucesso!');
    console.log('Email:', admin.email);
    console.log('Username:', admin.username);
    console.log('Role:', admin.role);
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
