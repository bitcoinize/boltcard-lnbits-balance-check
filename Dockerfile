FROM node:18-alpine as back_end
WORKDIR /usr/src/app

COPY . .

WORKDIR /usr/src/app/back_end

RUN npm install

FROM back_end as front_end
WORKDIR /usr/src/app/front_end

RUN npm ci --no-audit
RUN npm run build && rm -rf node_modules

FROM node:18-alpine
WORKDIR /usr/src/app
COPY --from=back_end /usr/src/app/back_end ./back_end
COPY --from=front_end /usr/src/app/front_end/build ./front_end/build

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

EXPOSE 3000

CMD ["node", "/usr/src/app/back_end/index.js"]