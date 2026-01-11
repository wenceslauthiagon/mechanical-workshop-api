import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { API_TAGS } from './shared/constants/messages.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
    origin: process.env.NODE_ENV === 'production' ? false : true,
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

  const document = SwaggerModule.createDocument(app, config);

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

  const port = parseInt(process.env.PORT || '3000', 10);
  const host = process.env.HOST || '0.0.0.0';

  await app.listen(port, host);
}

void bootstrap();
