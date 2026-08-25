FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# # Use node as the base image
# FROM node

# WORKDIR /app

# # Copy package files
# COPY package*.json ./

# # Install dependencies
# RUN npm install

# # Copy the rest of the application
# COPY . .

# # Expose Vite's default port
# EXPOSE 5173

# # Run the development server
# CMD ["npm", "run", "dev"]
