FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --ignore-scripts

COPY . .

RUN npm run build

FROM alpine:3.21 AS runner

RUN apk add --no-cache nodejs

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.cjs"]