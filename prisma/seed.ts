import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@oficina.com',
      passwordHash: hashedPassword,
      role: 'ADMIN',
    },
  });

  const services = [
    {
      name: 'Troca de Óleo',
      description: 'Troca de óleo do motor com filtro',
      price: 150.0,
      estimatedMinutes: 30,
      category: 'Manutenção Preventiva',
    },
    {
      name: 'Alinhamento e Balanceamento',
      description: 'Alinhamento e balanceamento das rodas',
      price: 120.0,
      estimatedMinutes: 60,
      category: 'Manutenção Preventiva',
    },
    {
      name: 'Revisão de Freios',
      description: 'Inspeção e regulagem do sistema de freios',
      price: 200.0,
      estimatedMinutes: 90,
      category: 'Manutenção Preventiva',
    },
    {
      name: 'Troca de Correia Dentada',
      description: 'Substituição da correia dentada do motor',
      price: 450.0,
      estimatedMinutes: 180,
      category: 'Manutenção Preventiva',
    },
    {
      name: 'Troca de Pastilhas de Freio',
      description: 'Substituição das pastilhas de freio dianteiras',
      price: 280.0,
      estimatedMinutes: 60,
      category: 'Manutenção Corretiva',
    },
    {
      name: 'Troca de Embreagem',
      description: 'Substituição do kit de embreagem completo',
      price: 1200.0,
      estimatedMinutes: 300,
      category: 'Manutenção Corretiva',
    },
    {
      name: 'Diagnóstico de Injeção Eletrônica',
      description: 'Análise computadorizada do sistema de injeção',
      price: 180.0,
      estimatedMinutes: 60,
      category: 'Elétrica',
    },
    {
      name: 'Troca de Bateria',
      description: 'Substituição da bateria do veículo',
      price: 350.0,
      estimatedMinutes: 20,
      category: 'Elétrica',
    },
    {
      name: 'Reparo de Alternador',
      description: 'Desmontagem, limpeza e troca de componentes do alternador',
      price: 280.0,
      estimatedMinutes: 120,
      category: 'Elétrica',
    },
    {
      name: 'Troca de Velas',
      description: 'Substituição das velas de ignição',
      price: 120.0,
      estimatedMinutes: 45,
      category: 'Mecânica',
    },
    {
      name: 'Retífica de Motor',
      description: 'Retífica completa do motor',
      price: 3500.0,
      estimatedMinutes: 1200,
      category: 'Mecânica',
    },
    {
      name: 'Troca de Amortecedores',
      description: 'Substituição dos amortecedores dianteiros e traseiros',
      price: 800.0,
      estimatedMinutes: 120,
      category: 'Mecânica',
    },
  ];

  for (const service of services) {
    const existing = await prisma.service.findFirst({
      where: { name: service.name },
    });

    if (!existing) {
      await prisma.service.create({
        data: service,
      });
    }
  }

  const parts = [
    {
      name: 'Óleo Motor 5W30',
      partNumber: 'OIL-5W30-01',
      description: 'Óleo sintético para motor 5W30 - 1L',
      price: 45.0,
      stock: 50,
      minStock: 10,
      supplier: 'Castrol',
    },
    {
      name: 'Filtro de Óleo',
      partNumber: 'FLT-OIL-001',
      description: 'Filtro de óleo universal',
      price: 25.0,
      stock: 100,
      minStock: 20,
      supplier: 'Mann Filter',
    },
    {
      name: 'Filtro de Ar',
      partNumber: 'FLT-AIR-001',
      description: 'Filtro de ar do motor',
      price: 35.0,
      stock: 80,
      minStock: 15,
      supplier: 'Mann Filter',
    },
    {
      name: 'Filtro de Combustível',
      partNumber: 'FLT-FUEL-001',
      description: 'Filtro de combustível',
      price: 40.0,
      stock: 60,
      minStock: 15,
      supplier: 'Bosch',
    },
    {
      name: 'Pastilha de Freio Dianteira',
      partNumber: 'BRK-PAD-F01',
      description: 'Jogo de pastilhas de freio dianteiras',
      price: 120.0,
      stock: 40,
      minStock: 10,
      supplier: 'TRW',
    },
    {
      name: 'Pastilha de Freio Traseira',
      partNumber: 'BRK-PAD-R01',
      description: 'Jogo de pastilhas de freio traseiras',
      price: 100.0,
      stock: 35,
      minStock: 10,
      supplier: 'TRW',
    },
    {
      name: 'Disco de Freio Dianteiro',
      partNumber: 'BRK-DSC-F01',
      description: 'Par de discos de freio dianteiros',
      price: 280.0,
      stock: 20,
      minStock: 5,
      supplier: 'Fremax',
    },
    {
      name: 'Disco de Freio Traseiro',
      partNumber: 'BRK-DSC-R01',
      description: 'Par de discos de freio traseiros',
      price: 240.0,
      stock: 18,
      minStock: 5,
      supplier: 'Fremax',
    },
    {
      name: 'Correia Dentada',
      partNumber: 'BLT-TIM-001',
      description: 'Correia dentada do motor',
      price: 180.0,
      stock: 15,
      minStock: 5,
      supplier: 'Gates',
    },
    {
      name: 'Kit Embreagem',
      partNumber: 'CLT-KIT-001',
      description: 'Kit completo de embreagem (disco, platô e rolamento)',
      price: 650.0,
      stock: 8,
      minStock: 3,
      supplier: 'Luk',
    },
    {
      name: 'Bateria 60Ah',
      partNumber: 'BAT-60A-001',
      description: 'Bateria automotiva 60Ah',
      price: 420.0,
      stock: 12,
      minStock: 4,
      supplier: 'Moura',
    },
    {
      name: 'Vela de Ignição',
      partNumber: 'IGN-PLG-001',
      description: 'Vela de ignição padrão',
      price: 18.0,
      stock: 200,
      minStock: 50,
      supplier: 'NGK',
    },
    {
      name: 'Amortecedor Dianteiro',
      partNumber: 'SHK-FRT-001',
      description: 'Amortecedor dianteiro unitário',
      price: 180.0,
      stock: 16,
      minStock: 8,
      supplier: 'Cofap',
    },
    {
      name: 'Amortecedor Traseiro',
      partNumber: 'SHK-REA-001',
      description: 'Amortecedor traseiro unitário',
      price: 160.0,
      stock: 16,
      minStock: 8,
      supplier: 'Cofap',
    },
    {
      name: 'Fluido de Freio DOT 4',
      partNumber: 'FLD-BRK-D4',
      description: 'Fluido de freio DOT 4 - 500ml',
      price: 28.0,
      stock: 40,
      minStock: 15,
      supplier: 'Bosch',
    },
    {
      name: 'Líquido de Arrefecimento',
      partNumber: 'FLD-COL-001',
      description: 'Líquido de arrefecimento concentrado - 1L',
      price: 32.0,
      stock: 30,
      minStock: 10,
      supplier: 'Radiex',
    },
    {
      name: 'Lâmpada H4',
      partNumber: 'LMP-H4-001',
      description: 'Lâmpada farol H4 12V 60/55W',
      price: 15.0,
      stock: 100,
      minStock: 30,
      supplier: 'Osram',
    },
    {
      name: 'Correia Poly-V',
      partNumber: 'BLT-PLV-001',
      description: 'Correia poli-V do alternador',
      price: 45.0,
      stock: 25,
      minStock: 10,
      supplier: 'Gates',
    },
    {
      name: 'Tensor da Correia',
      partNumber: 'TNS-BLT-001',
      description: 'Tensor automático da correia',
      price: 95.0,
      stock: 12,
      minStock: 5,
      supplier: 'INA',
    },
    {
      name: 'Junta do Cabeçote',
      partNumber: 'GSK-HEAD-001',
      description: 'Junta do cabeçote do motor',
      price: 220.0,
      stock: 6,
      minStock: 2,
      supplier: 'Elring',
    },
  ];

  for (const part of parts) {
    await prisma.part.upsert({
      where: { partNumber: part.partNumber },
      update: {},
      create: part,
    });
  }

  console.log('Seed completed!');
  console.log(`- ${services.length} services created`);
  console.log(`- ${parts.length} parts created`);
  console.log('- 1 admin user created (username: admin, password: admin123)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
