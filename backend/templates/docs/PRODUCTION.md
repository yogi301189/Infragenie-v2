Deploying Your Application to Production Using InfraGenie

InfraGenie generates a complete, production-ready DevOps package for your application.
This guide explains how to take the files inside your generated ZIP and deploy your backend service into a real Kubernetes production environment using:

Docker

CI/CD (GitHub Actions / Jenkins / GitLab CI)

Kubernetes (K8s)

Helm

ArgoCD (GitOps)

Prometheus + Grafana (Monitoring)

This file walks through each step in a clean, self-contained, real-world workflow.

📦 1. ZIP Contents Overview

Your generated bundle contains:

Dockerfile
ci-cd/
  pipeline.yaml
k8s/
  deployment.yaml
  service.yaml
helm/
  Chart.yaml
  values.yaml
  templates/
    deployment.yaml
    service.yaml
gitops/
  argocd-application.yaml
monitoring/
  prometheus-scrape-config.yaml
  grafana-dashboard.json

docs/
  PRODUCTION.md
  architecture-diagram.png
  pipeline-sequence.png

README-INFRAGENIE.md


Each layer represents a stage in your infrastructure pipeline — from local build to full GitOps.

🐳 2. Build & Run Locally Using Docker

InfraGenie’s generated Dockerfile is production-ready.

Build image:
docker build -t your-dockerhub-username/your-app:latest .

Run container:
docker run -p 5000:5000 your-dockerhub-username/your-app:latest


If your application loads correctly in a browser or Postman:
Docker layer ✔️

🤖 3. Set Up CI/CD (GitHub Actions / Jenkins / GitLab)

The pipeline file is here:

ci-cd/pipeline.yaml


Move it based on the CI system you use:

GitHub Actions:

Place in your repo:

.github/workflows/app-ci.yml


Add required secrets:

DOCKERHUB_USERNAME

DOCKERHUB_TOKEN

The pipeline will:

Build container image

Login to Docker Hub

Push your image (tagged latest)

Trigger Kubernetes deployment (if GitOps enabled)

This step ensures your production environment always tracks the latest code.

CI layer ✔️

☸️ 4. Deploy Using Kubernetes Manifests

InfraGenie provides standard K8s manifests:

k8s/deployment.yaml
k8s/service.yaml


Modify image name:

image: your-dockerhub-username/your-app:latest

Deploy to cluster:
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml


Check status:

kubectl get pods
kubectl get svc


Your app is now running inside the cluster.

Kubernetes layer ✔️

🔧 5. Deploy with Helm (Recommended for Production)

Helm gives versioning, rollbacks, and easy upgrades.

InfraGenie includes a full Helm chart:

helm/
  Chart.yaml
  values.yaml
  templates/


Edit image details in values.yaml:

image:
  repository: your-dockerhub-username/your-app
  tag: "latest"

Install:
helm install your-app ./helm --namespace prod --create-namespace

Upgrade after new CI build:
helm upgrade your-app ./helm -n prod


This is how real companies manage production workloads.

Helm layer ✔️

🔁 6. Enable GitOps with ArgoCD (Automated Deployments)

ArgoCD config is included:

gitops/argocd-application.yaml


Edit repo details:

repoURL: https://github.com/your-org/your-infra-repo.git
path: charts/your-app
targetRevision: main
destination:
  namespace: prod

Deploy to ArgoCD:
kubectl apply -f gitops/argocd-application.yaml -n argocd


Now ArgoCD will:

Watch your Git repo

Apply changes automatically

Self-heal your application

Keep cluster state in sync with Git

GitOps layer ✔️

📊 7. Add Monitoring (Prometheus + Grafana)

InfraGenie includes:

monitoring/prometheus-scrape-config.yaml
monitoring/grafana-dashboard.json

Prometheus

Add scrape config inside your Prometheus values or config:

- job_name: 'your-app'
  static_configs:
    - targets: ['your-app.prod.svc.cluster.local:5000']

Grafana

Import the dashboard JSON into Grafana → update panels → attach Prometheus datasource.

Monitoring layer ✔️

🚀 8. Full Production Flow (End-to-End)

Here’s what production looks like using InfraGenie:

Developer pushes code → GitHub

GitHub Actions builds & pushes Docker image

Helm chart references latest image

ArgoCD detects chart update

ArgoCD applies changes to cluster

Kubernetes rolls out new pods

Prometheus scrapes app metrics

Grafana visualizes performance

This is the exact setup used by modern DevOps teams.