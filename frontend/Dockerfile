# Diz ao Docker que vou utilizar uma imagem limpa do Node 18, versão alpine (mais leve)
FROM node:18-alpine as builder

# Diz ao Docker que a partir de agora, estaremos trabalhando no diretório definido
WORKDIR /usr/src/app

# Copio os arquivos package*.json do contexto de build para o diretório criado anteriormente na imagem (./)
COPY package*.json ./ 

# Cria o node_modules e com todas dependências necessárias
RUN npm install 

# Copia todos os arquivos do contexto de build para o WORKDIR atual 
COPY . .

# Executa o script de build da imagem, para criar os arquivos estáticos em /app/dist
RUN npm run build 

# Aviso que usarei uma imagem limpa do nginx (ele ainda lembra o que foi feito no estágio anterior)
FROM nginx:stable-alpine

# Copio do estágio anterior a pasta /build e coloco ela em /usr/share/nginx/html no WORKDIR
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Documento que a aplicação escutará na porta 80 do container.
EXPOSE 80


