# 1. Base Node.js 22 LTS image
FROM node:22-bookworm-slim

# 2. Install Chromium and system dependencies required for Puppeteer PDF generation
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    fonts-noto-color-emoji \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# 3. Configure Puppeteer to use system-installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 4. Set application directory
WORKDIR /app

# 5. Copy package files first to leverage Docker layer caching
COPY package*.json ./

# 6. Install production dependencies
RUN npm ci --omit=dev || npm install --omit=dev

# 7. Copy application source
COPY . .

# 8. Configure runtime environment
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# 9. Start application
CMD ["node", "server.js"]
