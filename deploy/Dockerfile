# Combined Dockerfile for AI Control Center
# Serves both frontend and backend

FROM node:20-alpine

WORKDIR /app

# Install dependencies for both server and client build
COPY server/package*.json ./server/
COPY client/package*.json ./client/

RUN cd server && npm ci --only=production
RUN cd client && npm ci

# Copy source files
COPY server/ ./server/
COPY client/ ./client/

# Build frontend
RUN cd client && npm run build

# Copy built frontend to server's public folder
RUN mkdir -p server/public && cp -r client/dist/* server/public/

# Expose port
EXPOSE 3001

WORKDIR /app/server

# Enable test auth by default for cloud deployment
ENV TEST_AUTH=true
ENV NODE_ENV=production

CMD ["node", "server.js"]
