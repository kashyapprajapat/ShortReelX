FROM node:18

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

# Command to run the application
CMD ["node", "server.js"]
