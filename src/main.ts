import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

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
    .setTitle('Mechanical Workshop API')
    .setDescription(
      'Sistema Integrado de Atendimento e Execução de Serviços para Oficina Mecânica',
    )
    .setVersion('1.0')
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
  SwaggerModule.setup('api/swagger', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(
    `Swagger docs available at: http://localhost:${port}/api/swagger`,
  );
}

void bootstrap();
