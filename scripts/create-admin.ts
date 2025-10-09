import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

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

    // Criar usuário admin padrão
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@workshop.com',
        passwordHash: hashedPassword,
        role: UserRole.ADMIN,
      },
    });

    console.log('Usuário admin criado com sucesso!');
    console.log('Email:', admin.email);
    console.log('Username:', admin.username);
    console.log('Senha: admin123');
    console.log('Role:', admin.role);
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
