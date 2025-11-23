FROM node:18-bullseye

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    libxtst6 libxss1 libnss3 libasound2 libatk-bridge2.0-0 libgtk-3-0 \
    ca-certificates zip && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /workspace/app
COPY package*.json ./
RUN npm ci
COPY . .

ENV NODE_ENV=production
ENV BACKEND_URL=http://localhost:3000

RUN npm run build:linux

CMD ["bash", "-lc", "ls -lh dist && echo 'Artifacts ready in dist/'"]
