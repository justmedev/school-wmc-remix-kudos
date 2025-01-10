# Build stage
FROM node:23.6-alpine3.20 as builder

WORKDIR /app
COPY yarn.lock package.json ./

RUN yarn install
COPY . .
RUN yarn build


FROM node:23.6-alpine3.20 as builder

WORKDIR /app
COPY yarn.lock package.json ./
RUN NODE_ENV=production && yarn
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
RUN yarn prismagen

EXPOSE 3000
CMD ["yarn", "start"]
