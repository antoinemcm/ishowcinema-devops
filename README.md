# Contenu du README.md optimisé pour le rendu de projet
readme_final = """# 🎬 IShowCinema - Plateforme de Films (TME Ops)

Ce projet est une application web complète (Fullstack) permettant de consulter des films, de s'inscrire et de gérer ses favoris. Il démontre la mise en œuvre d'une architecture micro-services conteneurisée et orchestrée.

## 🏗 Architecture du Projet

L'application est découpée en plusieurs composants :
* **Frontend** : Interface React (Vite) pour la navigation et l'interaction.
* **Backend** : API FastAPI (Python) gérant l'authentification et les données.
* **Base de données** : MongoDB pour la persistance des utilisateurs et favoris.
* **Cache** : Redis pour l'optimisation des sessions.

---

## 🚀 Installation et Lancement

### 1. Pré-requis
* Docker & Docker Compose
* Minikube & kubectl

### 2. Déploiement Kubernetes (Méthode recommandée)
Pour lancer l'application complète dans un cluster local :

```bash
chmod +x start.sh
./start.sh
```

**Accès :**
* 🌐 **Site Web** : [http://localhost:5173](http://localhost:5173)
* ⚙️ **API Documentation** : [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🛠 Concepts DevOps implémentés

* **Orchestration** : Gestion des cycles de vie des conteneurs via Kubernetes.
* **Haute Disponibilité** : Configuration de 2 réplicas pour le Backend.
* **Service Discovery** : Communication interne via DNS Kubernetes (ex: `mongodb-service`).
* **CI/CD** : Pipeline GitLab automatisant le test des fichiers et le build du frontend.
* **Scripts d'automatisation** : Centralisation des commandes complexes dans des scripts shell.

---

## 📂 Structure des fichiers
* `/frontend` : Code source React et Dockerfile.
* `/backend` : Code source FastAPI, modèles de données et Dockerfile.
* `/k8s` : Manifestes Kubernetes (Deployments, Services).
* `.gitlab-ci.yml` : Configuration de l'intégration continue.
* `start.sh` : Script de gestion des tunnels port-forward.

---

## 👤 Auteurs
Projet réalisé dans le cadre de l'UE Opsci 2026.

HALILOU Yanis 
-SAURET Antoine 