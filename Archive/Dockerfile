FROM node:18-alpine

WORKDIR /app

# Install dependencies required for node-gyp and other builds
RUN apk add --no-cache python3 make g++ git

# Copy package files first
COPY package*.json ./
COPY postcss.config.mjs ./
COPY tailwind.config.js ./
COPY next.config.mjs ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_SHARP_PATH=/tmp/node_modules/sharp
ENV NEXT_RUNTIME="nodejs"

# Define build arguments
ARG BOOQABLE_COMPANY_SLUG
ARG BOOQABLE_API_KEY
ARG GMAIL_EMAIL
ARG GMAIL_APP_PASSWORD
ARG AIRTABLE_API_KEY
ARG AIRTABLE_BASE_ID

# Create .env file with proper environment variables
RUN echo "# Booqable Configuration" > .env && \
    echo "BOOQABLE_COMPANY_SLUG=${BOOQABLE_COMPANY_SLUG}" >> .env && \
    echo "BOOQABLE_API_KEY=${BOOQABLE_API_KEY}" >> .env && \
    echo "" >> .env && \
    echo "# Gmail Configuration" >> .env && \
    echo "GMAIL_EMAIL=${GMAIL_EMAIL}" >> .env && \
    echo "GMAIL_APP_PASSWORD=${GMAIL_APP_PASSWORD}" >> .env && \
    echo "" >> .env && \
    echo "# Airtable Configuration" >> .env && \
    echo "AIRTABLE_API_KEY=${AIRTABLE_API_KEY}" >> .env && \
    echo "AIRTABLE_BASE_ID=${AIRTABLE_BASE_ID}" >> .env && \
    echo "NEXT_PUBLIC_AIRTABLE_API_KEY=${AIRTABLE_API_KEY}" >> .env && \
    echo "NEXT_PUBLIC_AIRTABLE_BASE_ID=${AIRTABLE_BASE_ID}" >> .env

# Build the application
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]