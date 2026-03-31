
# 1️⃣ Image Node
FROM node:20-slim

# 2️⃣ Dossier de travail
WORKDIR /app

# 3️⃣ Copier package.json et package-lock.json
COPY package*.json ./

ENV HTTP_PROXY="http://proxy:3128"
ENV HTTPS_PROXY="http://proxy:3128"
# 4️⃣ Installer les dépendances
RUN npm install


# 5️⃣ Copier tout le code
COPY . .

# 6️⃣ Exposer le port
EXPOSE 5173

# 7️⃣ Lancer le serveur de dev React
CMD ["npm", "run", "dev"]