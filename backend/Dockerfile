# backend/Dockerfile (para Desenvolvimento)

FROM node:18-alpine

# Define o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copia primeiro o package.json e o lockfile para aproveitar o cache do Docker.
# O 'npm install' só será executado novamente se estes arquivos mudarem.
COPY package*.json ./

# Instala TODAS as dependências, incluindo as de desenvolvimento ('devDependencies')
RUN npm install

# Copia o restante do código-fonte do seu projeto
COPY . .

# Expõe a porta que a aplicação NestJS usa
EXPOSE 3000

# O comando padrão para iniciar o container. Será sobrescrito pelo docker-compose,
# mas é uma boa prática documentá-lo aqui.
CMD ["npm", "run", "start:dev"]