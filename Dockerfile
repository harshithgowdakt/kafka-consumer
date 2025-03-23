# Build Stage 1: Compile NestJS App
FROM node:22.14.0 AS appbuild
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage: Create Clean Image
FROM node:22.14.0
WORKDIR /app
COPY --from=appbuild /app/package*.json ./
COPY --from=appbuild /app/node_modules ./node_modules
COPY --from=appbuild /app/dist ./dist
EXPOSE 8001
CMD ["node", "dist/main"]
