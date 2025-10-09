import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { APP_CONSTANTS, ENV_KEYS } from './shared/constants/app.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? false : true,
    credentials: true,
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle(process.env[ENV_KEYS.SWAGGER_TITLE] || APP_CONSTANTS.APP_NAME)
    .setDescription(
      process.env[ENV_KEYS.SWAGGER_DESCRIPTION] ||
        APP_CONSTANTS.APP_DESCRIPTION,
    )
    .setVersion(
      process.env[ENV_KEYS.SWAGGER_VERSION] || APP_CONSTANTS.APP_VERSION,
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Customers', 'Gestão de clientes (CPF/CNPJ)')
    .addTag('Vehicles', 'Gestão de veículos')
    .addTag('Services', 'Gestão de serviços')
    .addTag('Parts', 'Gestão de peças e insumos')
    .addTag('Service Orders', 'Gestão de ordens de serviço')
    .addTag('Health Check', 'Monitoramento da API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const swaggerPath =
    process.env[ENV_KEYS.SWAGGER_PATH] || APP_CONSTANTS.DEFAULT_SWAGGER_PATH;
  SwaggerModule.setup(`${swaggerPath}/swagger`, app, document);

  const port = parseInt(
    process.env[ENV_KEYS.PORT] || APP_CONSTANTS.DEFAULT_PORT.toString(),
    10,
  );
  const host = process.env[ENV_KEYS.HOST] || APP_CONSTANTS.DEFAULT_HOST;

  await app.listen(port, host);

  const displayHost = host === '0.0.0.0' ? 'localhost' : host;
  console.log(`Application is running on: http://${displayHost}:${port}`);
  console.log(
    `Swagger docs available at: http://${displayHost}:${port}/${swaggerPath}/swagger`,
  );
}

void bootstrap();
