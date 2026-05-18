import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { PrismaClient } from "@prisma/client";
import * as jwt from "jsonwebtoken";

const prisma = new PrismaClient();

interface LoginRequest {
  cpf: string;
}

interface JWTPayload {
  customerId: string;
  document: string;
  type: string;
  status: string;
  name: string;
  email: string;
}

async function httpTrigger(
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("Azure Function: CPF Authentication triggered");

  try {
    const body = await req.json() as LoginRequest;
    const { cpf } = body;

    const jwtSecret = process.env.JWT_SECRET || "default-secret-key";
    const jwtExpiration = process.env.JWT_EXPIRATION || "24h";

    // Validar formato do CPF
    if (!cpf || !isValidCPF(cpf)) {
      return {
        status: 400,
        jsonBody: {
          message: "CPF inválido",
          error: "Bad Request",
          statusCode: 400,
        },
      };
    }

    // Remover formatação do CPF
    const cleanCPF = cpf.replaceAll(/\D/g, "");

    // Consultar cliente no banco
    const customer = await prisma.customer.findUnique({
      where: {
        document: cleanCPF,
      },
      select: {
        id: true,
        document: true,
        type: true,
        isActive: true,
        name: true,
        email: true,
      },
    });

    if (!customer) {
      return {
        status: 404,
        jsonBody: {
          message: "Cliente não encontrado",
          error: "Not Found",
          statusCode: 404,
        },
      };
    }

    // Verificar se é pessoa física (CPF tem 11 dígitos)
    if (customer.type !== "PESSOA_FISICA") {
      return {
        status: 400,
        jsonBody: {
          message: "Autenticação por CPF disponível apenas para pessoa física",
          error: "Bad Request",
          statusCode: 400,
        },
      };
    }

    // Verificar status do cliente
    if (!customer.isActive) {
      return {
        status: 403,
        jsonBody: {
          message: "Cliente inativo",
          error: "Forbidden",
          statusCode: 403,
        },
      };
    }

    // Gerar JWT

    const payload: JWTPayload = {
      customerId: customer.id,
      document: customer.document,
      type: customer.type,
      status: "ACTIVE",
      name: customer.name,
      email: customer.email,
    };

    const token = jwt.sign(payload, jwtSecret, {
      expiresIn: jwtExpiration as jwt.SignOptions['expiresIn'],
      issuer: "mechanical-workshop-auth",
      subject: customer.id,
    });

    return {
      status: 200,
      jsonBody: {
        message: "Autenticação realizada com sucesso",
        token,
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          document: customer.document,
        },
      },
    };
  } catch (error) {
    context.error("Error in authentication:", error);
    return {
      status: 500,
      jsonBody: {
        message: "Erro interno do servidor",
        error: "Internal Server Error",
        statusCode: 500,
      },
    };
  } finally {
    await prisma.$disconnect();
  }
}

function isValidCPF(cpf: string): boolean {
  const cleanCPF = cpf.replaceAll(/\D/g, "");

  if (cleanCPF.length !== 11) {
    return false;
  }

  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }

  // Validar dígitos verificadores
  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += Number.parseInt(cleanCPF.substring(i - 1, i), 10) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }

  if (remainder !== Number.parseInt(cleanCPF.substring(9, 10), 10)) {
    return false;
  }

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += Number.parseInt(cleanCPF.substring(i - 1, i), 10) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }

  if (remainder !== Number.parseInt(cleanCPF.substring(10, 11), 10)) {
    return false;
  }

  return true;
}

// Registrar a função HTTP
app.http("auth", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: httpTrigger,
});

export default httpTrigger;
