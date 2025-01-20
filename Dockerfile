# Build stage
FROM node:23.6-bookworm AS builder

ENV YARN_VERSION=4.5.1

WORKDIR /app
# install and use yarn 4.x
RUN corepack enable \
    && corepack prepare yarn@stable --activate \
    && yarn set version ${YARN_VERSION} \
    && yarn plugin import interactive-tools \
    && echo -e "nodeLinker: node-modules\n\n$(cat /app/.yarnrc.yml)" > /app/.yarnrc.yml \
    && cat /app/.yarnrc.yml \
    && printf "Switched to Yarn version: "; yarn --version

COPY yarn.lock package.json .yarnrc.yml ./
RUN yarn workspaces focus -A --production && yarn install #RUN yarn install --production --ignore-optional --verbose
COPY . .
RUN yarn build

FROM node:23.6-bookworm AS runner

RUN corepack enable && yarn set version $YARN_VERSION && yarn install

WORKDIR /app
COPY yarn.lock package.json .yarnrc.yml .docker.env prisma ./
RUN NODE_ENV=production && yarn
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public
RUN yarn add @prisma/client; yarn dlx prisma generate

EXPOSE 3000
CMD ["yarn", "start"]
