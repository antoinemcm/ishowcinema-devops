#!/bin/bash

# 1. Vérifier si Minikube tourne
if ! minikube status > /dev/null 2>&1; then
    echo -e "Démarrage de Minikube"
    minikube start
fi

# 2. Builder les images Docker localement
echo -e "Construction des images Docker"
docker compose build

# 3. Charger les images dans le cache de Minikube
echo -e "Chargement des images dans Minikube (cela peut prendre un moment)"
minikube image load opsci2025_tme4-frontend:latest
minikube image load opsci2025_tme4-backend:latest

# 4. Appliquer les fichiers Kubernetes
echo -e "Déploiement des fichiers YAML"
kubectl apply -f k8s/

# 5. Attendre que les Pods soient prêts
echo -e "Attente du démarrage des Pods"
kubectl wait --for=condition=ready pod -l app=frontend --timeout=60s

# 6. Lancement des tunnels en arrière-plan
echo -e "Lancement des tunnels"
pkill -f "port-forward"
kubectl port-forward service/frontend-service 5173:5173 > /dev/null 2>&1 &
kubectl port-forward service/backend-service 8000:8000 > /dev/null 2>&1 &


echo -e "DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !"
echo -e "Site : http://localhost:5173${NC}"
echo -e "API Docs : http://localhost:8000/docs"
echo "Laissez ce terminal ouvert pour garder les tunnels actifs."
wait