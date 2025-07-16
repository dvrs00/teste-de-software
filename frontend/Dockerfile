# frontend/Dockerfile (para Desenvolvimento)

FROM node:18-alpine

# No frontend, o Vite geralmente usa a porta 5173 por padrão
# Verifique no seu frontend/package.json qual porta o 'npm run dev' usa
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Expõe a porta do servidor de desenvolvimento
EXPOSE 5173

# Comando para iniciar o servidor de desenvolvimento
CMD ["npm", "run", "dev"]