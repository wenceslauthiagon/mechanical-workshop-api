# 🔧 Sistema Integrado de Oficina Mecânica

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)

## 📋 Sobre o Projeto

Sistema Integrado de Atendimento e Execução de Serviços para oficina mecânica, desenvolvido como MVP (Minimum Viable Product) seguindo os princípios de **Domain-Driven Design (DDD)** e **Clean Architecture**.

### 🎯 Funcionalidades Principais

- **Gestão de Clientes**: CRUD completo com validação de CPF/CNPJ
- **Controle de Veículos**: Cadastro e gerenciamento de veículos por cliente
- **Ordens de Serviço**: Fluxo completo desde criação até entrega
- **Gestão de Peças**: Controle de estoque e preços
- **Autenticação JWT**: Segurança para APIs administrativas
- **Documentação API**: Swagger/OpenAPI integrado
- **Rastreamento em Tempo Real**: Acompanhamento do status dos serviços

### 🏗️ Arquitetura

```
src/
├── 📁 domain/              # Entidades e regras de negócio
│   ├── entities/           # Entidades do domínio
│   └── repositories/       # Interfaces dos repositórios
├── 📁 application/         # Casos de uso e DTOs
│   ├── dtos/              # Data Transfer Objects
│   └── use-cases/         # Lógica de aplicação
├── 📁 infrastructure/      # Implementações externas
│   ├── database/          # TypeORM e entidades
│   └── auth/              # Autenticação JWT
├── 📁 presentation/        # Controllers e APIs REST
│   └── controllers/       # Endpoints HTTP
└── 📁 shared/             # Código compartilhado
    └── enums/             # Enumerações
```

## 🚀 Tecnologias Utilizadas

- **Backend**: NestJS v11 + TypeScript
- **Banco de Dados**: PostgreSQL 15
- **ORM**: TypeORM
- **Autenticação**: JWT (JSON Web Tokens)
- **Validação**: class-validator + class-transformer
- **Documentação**: Swagger/OpenAPI
- **Containerização**: Docker + Docker Compose
- **Testes**: Jest
- **Linting**: ESLint + Prettier

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
