# ---- Build Stage ----
FROM node:22.16-alpine AS build

ARG DATABASE_URL
# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy the rest of the application
COPY . .

# Migrate database
RUN DATABASE_URL=${DATABASE_URL} npm run db:migrate

# Seed Database
RUN DATABASE_URL=${DATABASE_URL} npm run db:seed

# Build the TypeScript code
RUN npm run build

# ---- Production Stage ----
FROM node:22.16-alpine AS production


# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy Prisma schema (needed for the client)
COPY prisma/schema.prisma ./prisma/

# Copy built app from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/generated ./dist/generated

# Expose the port the app runs on
EXPOSE 3000

  RUN echo "Contents of /app/dist in production stage:" && ls -R /app/dist


# Start the application
CMD ["node", "dist/src/server.js"]
