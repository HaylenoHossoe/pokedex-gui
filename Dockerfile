# Dockerfile para a aplicação React

# Estágio de build
# Usa a imagem oficial do Node.js para buildar a aplicação React
FROM node:20-alpine AS build-stage

WORKDIR /app

# Adicione estas linhas para garantir que o Alpine esteja completamente atualizado neste estágio
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

# Copia o package.json e package-lock.json (se existir) para instalar dependências
COPY package*.json ./

RUN npm install

# Copia o restante do código da aplicação
COPY . .

# Faz o build da aplicação React
RUN npm run build

# Estágio de produção
# Usa uma imagem leve do Nginx para servir os arquivos estáticos
FROM nginx:stable-alpine AS production-stage

# Adicione estas linhas para garantir que o Alpine esteja completamente atualizado neste estágio
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

# Remova a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia o build da aplicação React do estágio anterior para o diretório de serviço do Nginx
COPY --from=build-stage /app/build /usr/share/nginx/html

# Copia uma configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80 (padrão HTTP do Nginx)
EXPOSE 80

# Comando para iniciar o Nginx quando o contêiner for executado
CMD ["nginx", "-g", "daemon off;"]