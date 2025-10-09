import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { APP_CONSTANTS, ENV_KEYS } from './shared/constants/app.constants';
import { API_TAGS } from './shared/constants/messages.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? false : true,
    credentials: true,
  });

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
        description: API_TAGS.JWT_DESCRIPTION,
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Customers', API_TAGS.CUSTOMERS)
    .addTag('Vehicles', API_TAGS.VEHICLES)
    .addTag('Services', API_TAGS.SERVICES)
    .addTag('Parts', API_TAGS.PARTS)
    .addTag('Service Orders', API_TAGS.SERVICE_ORDERS)
    .addTag('Health Check', API_TAGS.HEALTH_CHECK)
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
