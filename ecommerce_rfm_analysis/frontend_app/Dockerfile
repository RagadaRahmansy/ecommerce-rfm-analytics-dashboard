FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Vite exposes on 5173 by default. We need to allow --host
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
