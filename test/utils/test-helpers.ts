import { faker } from '@faker-js/faker/locale/pt_BR';

export function generateValidCPF(): string {
  const numbers = Array.from({ length: 9 }, () =>
    faker.number.int({ min: 0, max: 9 }),
  );

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += numbers[i] * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  numbers.push(remainder);

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += numbers[i] * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  numbers.push(remainder);

  const cpf = numbers.join('');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}
