### Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY index.html ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY postcss.config.js ./
COPY tailwind.config.js ./
COPY eslint.config.js ./
COPY ./src ./src
COPY ./public ./public

# Default API URL points to /api on the same origin.
# You can override this at build time with:
#   docker build --build-arg VITE_API_URL=/api .
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

RUN npm install
RUN npm run build

### Runtime stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


