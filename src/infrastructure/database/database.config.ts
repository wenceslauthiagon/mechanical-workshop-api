import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  const config = {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5433', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'mechanical_workshop',
    entities: ['dist/src/infrastructure/database/entities/*.entity.js'],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: false,
    migrations: ['dist/migrations/*.js'],
    migrationsTableName: 'migrations',
  };

  return config;
});
