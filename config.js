const { z } = require('zod');

const dbConfigSchema = z.object({
    DB_NAME: z.string().default('lembretes_db'),
    DB_USER: z.string().default('root'),
    DB_PASSWORD: z.string().min(1, "DB_PASSWORD é obrigatório"),
    DB_HOST: z.string().default('localhost'),
    DB_PORT: z.string().transform((val) => {
        const num = parseInt(val, 10);
        if (isNaN(num) || num < 1 || num > 65535) {
            throw new Error("DB_PORT deve ser um número válido entre 1 e 65535");
        }
        return num;
    }).default('3307'), 
});


const parsedConfig = dbConfigSchema.safeParse(process.env);

if (!parsedConfig.success) {
    console.error("Erro na configuração do banco de dados:", parsedConfig.error.format());
    process.exit(1); // Encerra o processo se a configuração for inválida
}

module.exports = parsedConfig.data;