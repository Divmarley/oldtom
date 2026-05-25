# Use node as the base image
FROM node:latest

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Run the development server
CMD ["npm", "run", "dev"]
