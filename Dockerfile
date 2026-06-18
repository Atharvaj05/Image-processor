FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install bcrypt jsonwebtoken

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

RUN rm -rf dist

# Create required directories
RUN mkdir -p uploads transformed

EXPOSE 5000

CMD ["node", "src/server.js"]
