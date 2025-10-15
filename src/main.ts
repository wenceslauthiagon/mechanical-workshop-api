import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { APP_CONSTANTS, ENV_KEYS } from './shared/constants/app.constants';
import { API_TAGS } from './shared/constants/messages.constants';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { ErrorHandlerService } from './shared/services/error-handler.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global exception filter
  const errorHandlerService = new ErrorHandlerService();
  app.useGlobalFilters(new GlobalExceptionFilter(errorHandlerService));

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
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const swaggerPath =
    process.env[ENV_KEYS.SWAGGER_PATH] || APP_CONSTANTS.DEFAULT_SWAGGER_PATH;

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
          'Service Statistics',
          'Health Check',
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

  SwaggerModule.setup(`${swaggerPath}/swagger`, app, document, swaggerOptions);

  const port = parseInt(
    process.env[ENV_KEYS.PORT] || APP_CONSTANTS.DEFAULT_PORT.toString(),
    APP_CONSTANTS.RADIX_BASE_10,
  );
  const host = process.env[ENV_KEYS.HOST] || APP_CONSTANTS.DEFAULT_HOST;

  await app.listen(port, host);
}

void bootstrap();
