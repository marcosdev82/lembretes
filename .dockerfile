# Use uma imagem oficial do Node.js
FROM node:20

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia package.json e package-lock.json primeiro (para otimizar cache do Docker)
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia todo o código para dentro do container
COPY . .

# Expõe a porta que seu app usará
EXPOSE 3000

# Variáveis de ambiente (você pode sobrescrever no docker-compose ou pipeline)
ENV DB_NAME=lembretes_db
ENV DB_USER=root
ENV DB_PASSWORD=password
ENV DB_HOST=mysql_node
ENV DB_PORT=3306

# Comando padrão para iniciar a aplicação
CMD ["npm", "start"]
