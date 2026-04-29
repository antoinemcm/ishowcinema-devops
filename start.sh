#!/bin/bash

set -e

VERSION=v1

if ! minikube status > /dev/null 2>&1; then
    echo -e "Démarrage de Minikube"
    minikube start
fi

echo "Build des images"
docker build -t opsci2025_tme4-backend:$VERSION ./backend
docker build -t opsci2025_tme4-frontend:$VERSION ./frontend

echo "Chargement dans Minikube"
minikube image load opsci2025_tme4-backend:$VERSION
minikube image load opsci2025_tme4-frontend:$VERSION

echo "🧹 Suppression anciens déploiements"
kubectl delete -f k8s/ --ignore-not-found

# LA PAUSE CRUCIALE (Laisse le temps à Kubernetes de nettoyer)
echo "Pause de 5 secondes pour le nettoyage..."
sleep 5

echo "Déploiement Kubernetes"
kubectl apply -f k8s/

echo "Attente de la stabilisation des déploiements"
# LA CORRECTION EST ICI : on surveille le déploiement général, pas les petits pods
kubectl rollout status deployment/backend --timeout=120s
kubectl rollout status deployment/frontend --timeout=120s
kubectl rollout status deployment/mongodb-deployment --timeout=120s
kubectl rollout status deployment/redis --timeout=120s

echo "Port forwarding"
pkill -f "port-forward" || true
# On utilise 0.0.0.0 pour que tu puisses y accéder depuis le navigateur de ton vrai PC
kubectl port-forward --address 0.0.0.0 service/frontend-service 5173:5173 > /dev/null 2>&1 &
kubectl port-forward --address 0.0.0.0 service/backend-service 8000:8000 > /dev/null 2>&1 &

echo ""
echo "DÉPLOIEMENT OK"
# On récupère automatiquement l'IP de ta VM pour te donner le bon lien
echo "Frontend : http://localhost:5173"
echo "API Docs : http://localhost:8000/docs"
echo ""
echo " Laisse ce terminal ouvert"
wait