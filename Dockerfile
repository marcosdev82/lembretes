# Use uma imagem oficial do Node.js
FROM node:20

# Define argumentos de build (recebidos do GitHub Actions ou docker build)
ARG DB_NAME
ARG DB_USER
ARG DB_PASSWORD
ARG DB_HOST
ARG DB_PORT

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

# Torna os argumentos disponíveis como variáveis de ambiente
ENV DB_NAME=${DB_NAME}
ENV DB_USER=${DB_USER}
ENV DB_PASSWORD=${DB_PASSWORD}
ENV DB_HOST=${DB_HOST}
ENV DB_PORT=${DB_PORT}

# Comando padrão para iniciar a aplicação
CMD ["npm", "start"]
