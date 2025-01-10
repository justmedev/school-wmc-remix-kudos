# Build stage
FROM node:23.6-bookworm as builder

ENV YARN_VERSION 4.5.1

# install and use yarn 4.x
RUN corepack enable && corepack prepare yarn@${YARN_VERSION} && yarn set version berry #$YARN_VERSION

WORKDIR /app
COPY yarn.lock package.json ./

RUN yarn workspaces focus -A --production #RUN yarn install --production --ignore-optional --verbose
COPY . .
RUN yarn build


FROM node:23.6-bookworm as runner

RUN corepack enable && yarn set version $YARN_VERSION && yarn install

WORKDIR /app
COPY yarn.lock package.json ./
RUN NODE_ENV=production && yarn
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
RUN yarn prisma generate

EXPOSE 3000
CMD ["yarn", "start"]
