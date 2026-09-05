# Primera etapa: instala solamente las dependencias necesarias en producción.
FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev


# Segunda etapa: contiene el código y las dependencias que ejecutará la API.
FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node package*.json ./
COPY --chown=node:node src ./src

# Estas carpetas necesitan permisos de escritura durante la ejecución.
RUN mkdir -p logs uploads/users/documents uploads/deliveries/proofs \
  && chown -R node:node logs uploads

USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:' + process.env.PORT + '/health').then(response => { if (!response.ok) process.exit(1); }).catch(() => process.exit(1));"]

CMD ["npm", "start"]
