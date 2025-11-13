# Step 1: Build the frontend
FROM node:20-slim AS build

WORKDIR /app

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy only package.json first to generate a fresh lock file
COPY package.json ./

# Install dependencies (this will generate/update package-lock.json)
# Optional dependencies are installed by default in npm
RUN npm install

# Copy the rest of the application files (excluding node_modules and package-lock.json via .dockerignore)
COPY . .

RUN npm run build

# Step 2: Serve the built app using nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
