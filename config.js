import { z } from "zod";

const dbConfigSchema = z.object({
    DB_NAME: z.string().min(1),
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string().min(1),
    DB_HOST: z.string().min(1),
    DB_PORT: z
        .string()
        .transform((val) => Number(val))
        .refine((val) => !isNaN(val) && val > 0 && val <= 65535, {
            message: "DB_PORT deve ser um número válido entre 1 e 65535"
    })
});

const parsedConfig = dbConfigSchema.safeParse(process.env);

if (!parsedConfig.success) {
    console.error("Erro na configuração do banco de dados:", parsedConfig.error.format());
    process.exit(1); // Encerra o processo se a configuração for inválida
}

module.exports = parsedConfig.data;