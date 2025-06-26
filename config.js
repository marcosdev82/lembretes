require('dotenv').config();
const { z } = require('zod');

const schema = z.object({
  DB_NAME: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.preprocess(
    (val) => val ?? '3306',
    z.string().transform((val) => {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1 || num > 65535) {
        throw new Error("DB_PORT deve ser um número válido entre 1 e 65535");
      }
      return num;
    })
  ),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Erro na validação das variáveis de ambiente:", parsed.error.format());
  process.exit(1);
}

module.exports = parsed.data;
