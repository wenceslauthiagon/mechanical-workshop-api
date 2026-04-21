// Datadog tracer já inicializado via dd-trace-init.js
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AuthModule } from './auth/auth.module';
import { AuthCheckModule } from './auth-check/auth-check.module';
import { WorkshopModule } from './workshop/workshop.module';
import { API_TAGS } from './shared/constants/messages.constants';

const logger = new Logger('[API-SERVER]');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Workaround: prevent Swagger from crashing on circular metadata in some DTOs.
  // Keeps all routes visible while schemas are gradually normalized.
  const swaggerInternals = (await import(
    '@nestjs/swagger/dist/services/schema-object-factory'
  )) as {
    SchemaObjectFactory?: {
      prototype?: {
        createNotBuiltInTypeReference?: (...args: unknown[]) => unknown;
        __circularPatchApplied?: boolean;
      };
    };
  };

  const schemaFactoryPrototype = swaggerInternals.SchemaObjectFactory?.prototype;
  if (
    schemaFactoryPrototype?.createNotBuiltInTypeReference &&
    !schemaFactoryPrototype.__circularPatchApplied
  ) {
    const originalCreateNotBuiltInTypeReference =
      schemaFactoryPrototype.createNotBuiltInTypeReference;

    schemaFactoryPrototype.createNotBuiltInTypeReference = function (
      ...args: unknown[]
    ) {
      try {
        return originalCreateNotBuiltInTypeReference.apply(this, args);
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (message.includes('A circular dependency has been detected')) {
          return { type: 'object' };
        }
        throw error;
      }
    };

    schemaFactoryPrototype.__circularPatchApplied = true;
  }

  // Global exception filter
  // const errorHandlerService = new ErrorHandlerService();
  // app.useGlobalFilters(new GlobalExceptionFilter(errorHandlerService));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Mechanical Workshop API')
    .setDescription('API para gerenciamento de oficina mecânica')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: API_TAGS.JWT_DESCRIPTION,
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    include: [AuthModule, AuthCheckModule, WorkshopModule],
  });

  const swaggerPath = 'api';

  const swaggerOptions = {
    swaggerOptions: {
      tagsSorter: (a: string, b: string) => {
        const order = [
          'Auth',
          'Customers',
          'Vehicles',
          'Services',
          'Parts',
          'Service Orders',
          'Mechanics',
          'Budgets',
          'Public - Service Orders',
          'Public - Budgets',
          'Service Stats',
          'Health Check',
          'Auth Check',
        ];

        const indexA = order.indexOf(a);
        const indexB = order.indexOf(b);

        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;

        return indexA - indexB;
      },
    },
  };

  SwaggerModule.setup(swaggerPath, app, document, swaggerOptions);

  const port = Number.parseInt(process.env.PORT || '3000', 10);
  const host = process.env.HOST || '0.0.0.0';

  await app.listen(port, host);
  
  // Evidence Log para Terminal
  logger.log('═══════════════════════════════════════════════════════════');
  logger.log(`✅ API INICIADA COM SUCESSO`);
  logger.log(`📍 Host: http://127.0.0.1:${port}`);
  logger.log(`📎 Documentação: http://127.0.0.1:${port}/api`);
  logger.log(`🔒 Status: READY FOR REQUESTS`);
  logger.log('═══════════════════════════════════════════════════════════');
}

void bootstrap();
