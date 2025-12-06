FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies (including dev dependencies)
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Set environment variables
# ENV NODE_ENV=development
# ENV PORT=5000

# Expose port
EXPOSE 5173

# Start the app in development mode with hot reload
CMD ["npm", "run", "dev"]