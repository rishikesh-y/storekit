FROM node:19.3.0-alpine3.17 AS builder
ARG DATABASE_URL

WORKDIR /storekit

# Install app dependencies
ADD . .
RUN yarn

ENV NODE_ENV=production

RUN yarn build
RUN yarn prisma generate
RUN yarn prisma migrate deploy

FROM node:19.3.0-alpine AS runner

WORKDIR /storekit

COPY --from=builder /storekit/dist ./dist
COPY --from=builder /storekit/node_modules ./node_modules
COPY package*.json ./

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["yarn", "start:prod"]
