# InfraGenie – AI DevOps Copilot (v2)

InfraGenie is a DevOps copilot that generates:

- Dockerfiles  
- CI/CD pipelines (GitHub Actions, Jenkins, GitLab CI)  
- Kubernetes manifests  
- Helm charts  
- ArgoCD GitOps Application YAML  
- Optional Prometheus + Grafana configs  

You describe your stack, and InfraGenie prepares the infrastructure code for you.  

This repo contains:

- `backend/` – FastAPI service that generates configs  
- `frontend/` – Vite + React UI for interacting with InfraGenie

---

## 🧱 Tech Stack

**Backend**

- FastAPI
- Uvicorn
- Pydantic
- (Optional later: OpenAI / LLM integration)

**Frontend**

- React 18
- Vite
- Axios

---

## ⚙️ Prerequisites

- Python 3.11+  
- Node.js 18+ and npm  
- Git (optional but recommended)

---

## 🚀 Getting Started (Local Development)

### 1. Clone the repo

```bash
git clone https://github.com/yogi301189/infragenie-2.git
cd infragenie
