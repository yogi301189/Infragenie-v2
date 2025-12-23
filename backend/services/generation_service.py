from typing import Any, Dict, Optional
from services.ai_generation_service import AIGenerationService
from utils.logger import get_logger

logger = get_logger(__name__)


class GenerationService:
    """
    Core service that takes a GenerateRequest-like object (from routers.generate)
    and returns all the artefacts InfraScribe can generate.
    """

    def __init__(self):
        self.ai_service = AIGenerationService()

    # ==========================================================
    # RULE-BASED GENERATION (ALWAYS RETURNS A DICT)
    # ==========================================================
    async def generate(self, payload: Any) -> Dict[str, Any]:
        language = getattr(payload, "language", "python")
        framework = getattr(payload, "framework", None)
        cicd_tool = getattr(payload, "cicd_tool", "github_actions")
        deploy_target = getattr(payload, "deploy_target", "kubernetes")
        cloud_provider = getattr(payload, "cloud_provider", "aws")
        include_gitops = getattr(payload, "include_gitops", True)
        include_monitoring = getattr(payload, "include_monitoring", False)
        infra_preset = getattr(payload, "infra_preset", "all")

        logger.info("Starting infra generation", extra={
            "language": language,
            "framework": framework,
            "cicd_tool": cicd_tool,
            "deploy_target": deploy_target,
            "cloud_provider": cloud_provider,
        })

        # Dockerfile
        dockerfile = self._generate_dockerfile(language, framework)

        # CI/CD
        cicd_meta = self._generate_cicd(cicd_tool, language, framework)
        cicd_content = cicd_meta.get("content", "")

        # Kubernetes / Helm
        k8s_manifests = (
            self._generate_k8s_manifests(language, framework)
            if deploy_target in ("kubernetes", "helm")
            else None
        )

        helm_chart = (
            self._generate_helm_chart(language, framework)
            if deploy_target == "helm"
            else None
        )

        # GitOps
        argocd_app = (
            self._generate_argocd_app(cloud_provider)
            if include_gitops
            else None
        )

        # Monitoring
        monitoring_configs = (
            self._generate_monitoring_configs()
            if include_monitoring
            else None
        )

        # Terraform
        terraform_configs = self._generate_terraform_configs(
            cloud_provider, infra_preset
        )

        raw = {
            "meta": {
                "language": language,
                "framework": framework,
                "cicd_tool": cicd_tool,
                "deploy_target": deploy_target,
                "cloud_provider": cloud_provider,
                "infra_preset": infra_preset,
            }
        }

        readme_md = self._generate_readme(
            language=language,
            framework=framework,
            cicd_tool=cicd_tool,
            deploy_target=deploy_target,
            cloud_provider=cloud_provider,
            infra_preset=infra_preset,
            has_dockerfile=bool(dockerfile),
            has_cicd=bool(cicd_content),
            has_k8s=bool(k8s_manifests),
            has_helm=bool(helm_chart),
            has_argocd=bool(argocd_app),
            has_monitoring=bool(monitoring_configs),
            has_terraform=bool(terraform_configs),
        )

        return {
            "dockerfile": dockerfile,
            "cicd_config": cicd_content,
            "cicd_meta": cicd_meta,
            "k8s_manifests": k8s_manifests,
            "helm_chart": helm_chart,
            "argocd_app": argocd_app,
            "monitoring_configs": monitoring_configs,
            "terraform_configs": terraform_configs,
            "raw": raw,
            "readme_md": readme_md,
        }

    # ==========================================================
    # AI THICK MODE
    # ==========================================================
    async def generate_ai_thick(self, payload: Any) -> Dict[str, Any]:
        logger.info("AI Thick Mode: starting full AI generation")

        try:
            ai_output = await self.ai_service.generate_bundle(payload)

            if isinstance(ai_output, dict):
                logger.info("AI Thick Mode: generation successful")
                return ai_output

            logger.warning("AI output invalid, falling back")

        except Exception:
            logger.exception("AI Thick Mode failed")

        logger.warning("Falling back to rule-based generation")
        return await self.generate(payload)

    # ==========================================================
    # BELOW THIS: HELPERS (UNCHANGED)
    # ==========================================================
    # Dockerfile, CI/CD, K8s, Helm, ArgoCD, Terraform, Monitoring, README
    # (Your existing helper methods stay EXACTLY the same)


        # ---------------- Dockerfile ----------------
        dockerfile = self._generate_dockerfile(language, framework)

        # ---------------- CI/CD ----------------
        cicd_data = self._generate_cicd(cicd_tool, language, framework)
        cicd_content = cicd_data.get("content", "")
        cicd_meta = cicd_data  # full dict: {"filename": ..., "content": ...}

        # ---------------- K8s / Helm ----------------
        k8s_manifests = (
            self._generate_k8s_manifests(language, framework)
            if deploy_target in ("kubernetes", "helm")
            else None
        )

        helm_chart = (
            self._generate_helm_chart(language, framework)
            if deploy_target == "helm"
            else None
        )

        # ---------------- GitOps / ArgoCD ----------------
        argocd_app = (
            self._generate_argocd_app(cloud_provider=cloud_provider)
            if include_gitops
            else None
        )

        # ---------------- Monitoring ----------------
        monitoring_configs = (
            self._generate_monitoring_configs() if include_monitoring else None
        )

        # ---------------- Terraform ----------------
        terraform_configs = self._generate_terraform_configs(cloud_provider, infra_preset)

        # ---------------- Meta ----------------
        raw: Dict[str, Any] = {
            "meta": {
                "language": language,
                "framework": framework,
                "cicd_tool": cicd_tool,
                "deploy_target": deploy_target,
                "cloud_provider": cloud_provider,
                "infra_preset": infra_preset,
            }
        }

        # ---------------- README (rule-based) ----------------
        readme_md = self._generate_readme(
            language=language,
            framework=framework,
            cicd_tool=cicd_tool,
            deploy_target=deploy_target,
            cloud_provider=cloud_provider,
            infra_preset=infra_preset,
            has_dockerfile=bool(dockerfile),
            has_cicd=bool(cicd_content),
            has_k8s=bool(k8s_manifests),
            has_helm=bool(helm_chart),
            has_argocd=bool(argocd_app),
            has_monitoring=bool(monitoring_configs),
            has_terraform=bool(terraform_configs),
        )

        return {
            "dockerfile": dockerfile,
            "cicd_config": cicd_content,      # string for API / frontend
            "cicd_meta": cicd_meta,           # dict for ZIP builder
            "k8s_manifests": k8s_manifests,
            "helm_chart": helm_chart,
            "argocd_app": argocd_app,
            "monitoring_configs": monitoring_configs,
            "terraform_configs": terraform_configs,
            "raw": raw,
            "readme_md": readme_md,
        }

    


    



    # ---------------------- Dockerfile ---------------------- #

    def _generate_dockerfile(self, language: str, framework: Optional[str]) -> str:
        language = (language or "").lower()
        framework = (framework or "").lower()

        if language == "python":
            return self._dockerfile_python(framework)
        if language in ("node", "nodejs", "javascript", "js"):
            return self._dockerfile_node(framework)

        # Default fallback
        return (
            "# Generic Dockerfile generated by InfraScribe\n"
            "# TODO: adjust base image and commands for your stack.\n"
            "FROM alpine:3.19\n"
            "WORKDIR /app\n"
            "COPY . /app\n"
            "CMD [\"sh\"]\n"
        )

    def _dockerfile_python(self, framework: Optional[str]) -> str:
        """ 
        Python Dockerfile with non-root user (K8s-friendly).
        """
        app_cmd = "python app.py"
        if framework in ("fastapi",):
           app_cmd = "uvicorn main:app --host 0.0.0.0 --port 8000"

        return (
           "# Python Dockerfile generated by InfraScribe\n"
        "# Runs as a non-root user by default\n\n"
        "FROM python:3.11-slim\n\n"
        "ENV PYTHONDONTWRITEBYTECODE=1 \\\n"
        "    PYTHONUNBUFFERED=1\n\n"
        "# Create non-root user\n"
        "RUN addgroup --system app && adduser --system --ingroup app app\n\n"
        "WORKDIR /app\n\n"
        "# Install dependencies\n"
        "COPY requirements.txt ./\n"
        "RUN pip install --no-cache-dir -r requirements.txt\n\n"
        "# Copy application code\n"
        "COPY . .\n\n"
        "# Fix ownership\n"
        "RUN chown -R app:app /app\n\n"
        "# Switch to non-root user\n"
        "USER app\n\n"
        "# Expose application port\n"
        "EXPOSE 5000\n\n"
        "# Start the application\n"
        f'CMD ["bash", "-c", "{app_cmd}"]\n'
    )

    def _dockerfile_node(self, framework: Optional[str]) -> str:
        """
        Node.js Dockerfile with separate dependency layer.
        """
        return (
            "# Node.js Dockerfile generated by InfraScribe\n"
            "FROM node:20-alpine\n\n"
            "WORKDIR /app\n"
            "COPY package*.json ./\n"
            "RUN npm install --production\n\n"
            "COPY . .\n\n"
            "# Expose application port\n"
            "EXPOSE 3000\n\n"
            "# Start the application\n"
            'CMD ["npm", "start"]\n'
        )

    # ---------------------- CI/CD ---------------------- #

    def _generate_cicd(
        self,
        cicd_tool: str,
        language: str,
        framework: Optional[str],
    ) -> Dict[str, str]:
        """
        Returns:
            {
                "filename": "Jenkinsfile" | "github-actions.yaml" | ".gitlab-ci.yml",
                "content": "<file contents>"
            }
        """
        tool = cicd_tool.lower()

        if tool == "github_actions":
            return {
                "filename": "github-actions.yaml",
                "content": self._github_actions_workflow(language, framework),
            }

        if tool == "jenkins":
            return {
                "filename": "Jenkinsfile",
                "content": self._jenkinsfile(language, framework),
            }

        if tool == "gitlab_ci":
            return {
                "filename": ".gitlab-ci.yml",
                "content": self._gitlab_ci(language, framework),
            }

        # fallback
        return {
            "filename": "pipeline.yaml",
            "content": (
                "# Unknown CI/CD tool requested.\n"
                "# Please choose: github_actions | jenkins | gitlab_ci.\n"
            ),
        }

    def _github_actions_workflow(self, language: str, framework: Optional[str]) -> str:
        return (
            "# GitHub Actions workflow generated by InfraScribe\n"
            "name: InfraScribe CI\n\n"
            "on:\n"
            "  push:\n"
            "    branches: [ main ]\n"
            "  pull_request:\n"
            "    branches: [ main ]\n\n"
            "jobs:\n"
            "  build-and-push:\n"
            "    runs-on: ubuntu-latest\n\n"
            "    steps:\n"
            "      - name: Checkout\n"
            "        uses: actions/checkout@v4\n\n"
            "      - name: Set up Docker Buildx\n"
            "        uses: docker/setup-buildx-action@v3\n\n"
            "      - name: Login to Docker Hub\n"
            "        uses: docker/login-action@v3\n"
            "        with:\n"
            "          username: ${{ secrets.DOCKERHUB_USERNAME }}\n"
            "          password: ${{ secrets.DOCKERHUB_TOKEN }}\n\n"
            "      - name: Build and push image\n"
            "        uses: docker/build-push-action@v5\n"
            "        with:\n"
            "          context: .\n"
            "          push: true\n"
            "          tags: ${{ secrets.DOCKERHUB_USERNAME }}/your-app:latest\n"
        )

    def _jenkinsfile(self, language: str, framework: Optional[str]) -> str:
        return (
            "// Jenkinsfile generated by InfraScribe\n"
            "pipeline {\n"
            "  agent any\n\n"
            "  environment {\n"
            "    IMAGE = 'your-dockerhub-user/your-image'\n"
            "  }\n\n"
            "  stages {\n"
            "    stage('Checkout') {\n"
            "      steps {\n"
            "        checkout scm\n"
            "      }\n"
            "    }\n\n"
            "    stage('Build') {\n"
            "      steps {\n"
            "        sh 'docker build -t $IMAGE:latest .'\n"
            "      }\n"
            "    }\n\n"
            "    stage('Push') {\n"
            "      steps {\n"
            "        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'USER', passwordVariable: 'PASS')]) {\n"
            "          sh 'echo $PASS | docker login -u $USER --password-stdin'\n"
            "          sh 'docker push $IMAGE:latest'\n"
            "        }\n"
            "      }\n"
            "    }\n"
            "  }\n"
            "}\n"
        )

    def _gitlab_ci(self, language: str, framework: Optional[str]) -> str:
        return (
            "# .gitlab-ci.yml generated by InfraScribe\n"
            "stages:\n"
            "  - build\n"
            "  - push\n\n"
            "variables:\n"
            "  IMAGE_NAME: your-registry/your-image\n\n"
            "build:\n"
            "  stage: build\n"
            "  script:\n"
            "    - docker build -t $IMAGE_NAME:latest .\n\n"
            "push:\n"
            "  stage: push\n"
            "  script:\n"
            "    - docker push $IMAGE_NAME:latest\n"
        )

    # ---------------------- Kubernetes ---------------------- #

    def _generate_k8s_manifests(
        self,
        language: str,
        framework: Optional[str],
    ) -> Dict[str, str]:
        deployment_yaml = (
            "apiVersion: apps/v1\n"
            "kind: Deployment\n"
            "metadata:\n"
            "  name: app-deployment\n"
            "  labels:\n"
            "    app: app\n"
            "spec:\n"
            "  replicas: 2\n"
            "  selector:\n"
            "    matchLabels:\n"
            "      app: app\n"
            "  template:\n"
            "    metadata:\n"
            "      labels:\n"
            "        app: app\n"
            "    spec:\n"
            "      containers:\n"
            "        - name: app\n"
            "          image: your-dockerhub-user/your-image:latest\n"
            "          ports:\n"
            "            - containerPort: 5000\n"
            "          env:\n"
            "            - name: ENVIRONMENT\n"
            '              value: "production"\n'
        )

        service_yaml = (
            "apiVersion: v1\n"
            "kind: Service\n"
            "metadata:\n"
            "  name: app-service\n"
            "  labels:\n"
            "    app: app\n"
            "spec:\n"
            "  type: ClusterIP\n"
            "  selector:\n"
            "    app: app\n"
            "  ports:\n"
            "    - port: 80\n"
            "      targetPort: 5000\n"
        )

        return {
            "deployment.yaml": deployment_yaml,
            "service.yaml": service_yaml,
        }

    # ---------------------- Helm ---------------------- #

    def _generate_helm_chart(
        self,
        language: str,
        framework: Optional[str],
    ) -> Dict[str, str]:
        """
        Simple Helm chart with values + deployment + service.
        """
        chart_yaml = """apiVersion: v2
name: infrascribe-app
description: A sample chart generated by InfraScribe
type: application
version: 0.1.0
appVersion: "1.0.0"
"""

        values_yaml = """replicaCount: 2

image:
  repository: your-dockerhub-user/your-image
  tag: "latest"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

containerPort: 5000
"""

        deployment_tpl = """apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "infrascribe-app.fullname" . }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ include "infrascribe-app.name" . }}
  template:
    metadata:
      labels:
        app: {{ include "infrascribe-app.name" . }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          ports:
            - containerPort: {{ .Values.containerPort }}
"""

        service_tpl = """apiVersion: v1
kind: Service
metadata:
  name: {{ include "infrascribe-app.fullname" . }}
spec:
  type: {{ .Values.service.type }}
  selector:
    app: {{ include "infrascribe-app.name" . }}
  ports:
    - port: {{ .Values.service.port }}
      targetPort: {{ .Values.containerPort }}
"""

        helpers_tpl = """{{- define "infrascribe-app.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end }}

{{- define "infrascribe-app.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end }}
"""

        return {
            "Chart.yaml": chart_yaml,
            "values.yaml": values_yaml,
            "templates/_helpers.tpl": helpers_tpl,
            "templates/deployment.yaml": deployment_tpl,
            "templates/service.yaml": service_tpl,
        }

    # ---------------------- ArgoCD ---------------------- #

    def _generate_argocd_app(self, cloud_provider: Optional[str]) -> Dict[str, str]:
        """
        Generates ArgoCD Application YAMLs for:
        - dev
        - stage
        - prod
        plus a root app-of-apps.
        """
        app_dev = """# ArgoCD Application: DEV
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: infrascribe-app-dev
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/your-org/your-infra-repo.git
    targetRevision: main
    path: charts/infrascribe-app
    helm:
      valueFiles:
        - values-dev.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: dev
  syncPolicy:
    automated:
      selfHeal: true
      prune: true
"""

        app_stage = """# ArgoCD Application: STAGE
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: infrascribe-app-stage
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/your-org/your-infra-repo.git
    targetRevision: main
    path: charts/infrascribe-app
    helm:
      valueFiles:
        - values-stage.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: stage
  syncPolicy:
    automated:
      selfHeal: true
      prune: true
"""

        app_prod = """# ArgoCD Application: PROD
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: infrascribe-app-prod
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/your-org/your-infra-repo.git
    targetRevision: main
    path: charts/infrascribe-app
    helm:
      valueFiles:
        - values-prod.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: prod
  syncPolicy:
    automated:
      selfHeal: true
      prune: true
"""

        root_app = """# ArgoCD Root Application (App-of-Apps)
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: infrascribe-envs-root
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/your-org/your-infra-repo.git
    targetRevision: main
    path: gitops
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      selfHeal: true
      prune: true
"""

        return {
            "app-dev.yaml": app_dev,
            "app-stage.yaml": app_stage,
            "app-prod.yaml": app_prod,
            "infrascribe-root.yaml": root_app,
        }

    # ---------------------- Terraform (Infra) ---------------------- #

    def _generate_terraform_configs(
        self,
        cloud_provider: str,
        infra_preset: str,
    ) -> Dict[str, Dict[str, str]]:
        """
        Generate minimal Terraform presets:

        - preset = "eks"       -> eks/* files
        - preset = "ec2-k3s"   -> ec2/* files
        - preset = "ecs-fargate" -> ecs/* files
        - preset = "all"       -> all three
        - preset = "none"      -> {}
        """
        provider = (cloud_provider or "aws").lower()
        preset = (infra_preset or "all").lower()

        if provider != "aws":
            return {}

        eks = self._terraform_eks_minimal()
        ec2 = self._terraform_ec2_minimal()
        ecs = self._terraform_ecs_minimal()

        if preset == "none":
            return {}
        if preset == "eks":
            return {"eks": eks}
        if preset in ("ec2", "ec2-k3s"):
            return {"ec2": ec2}
        if preset in ("ecs", "ecs-fargate"):
            return {"ecs": ecs}

        # default: all
        return {
            "eks": eks,
            "ec2": ec2,
            "ecs": ecs,
        }

    def _terraform_common_provider(self) -> str:
        return """terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}
"""

    # ---------- EKS minimal preset ---------- #

    def _terraform_eks_minimal(self) -> Dict[str, str]:
        provider_tf = self._terraform_common_provider()

        variables_tf = """variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "infrascribe-eks"
}
"""

        main_tf = """# Minimal EKS cluster generated by InfraScribe
#
# 1) terraform init
# 2) terraform apply
"""

        eks_tf = """resource "aws_eks_cluster" "this" {
  name     = var.cluster_name
  role_arn = "arn:aws:iam::123456789012:role/eks-cluster-role" # TODO: replace

  vpc_config {
    subnet_ids = [] # TODO: fill in subnet IDs
  }
}
"""

        outputs_tf = """output "cluster_name" {
  value = aws_eks_cluster.this.name
}
"""

        return {
            "provider.tf": provider_tf,
            "variables.tf": variables_tf,
            "main.tf": main_tf,
            "eks.tf": eks_tf,
            "outputs.tf": outputs_tf,
        }

    # ---------- EC2 minimal preset ---------- #

    def _terraform_ec2_minimal(self) -> Dict[str, str]:
        provider_tf = self._terraform_common_provider()

        variables_tf = """variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}
"""

        main_tf = """resource "aws_instance" "docker_host" {
  ami           = "ami-0e742cca61fb65051"
  instance_type = var.instance_type

  tags = {
    Name = "infrascribe-docker-host"
  }
}
"""

        outputs_tf = """output "instance_public_ip" {
  value = aws_instance.docker_host.public_ip
}
"""

        return {
            "provider.tf": provider_tf,
            "variables.tf": variables_tf,
            "main.tf": main_tf,
            "outputs.tf": outputs_tf,
        }

    # ---------- ECS minimal preset ---------- #

    def _terraform_ecs_minimal(self) -> Dict[str, str]:
        provider_tf = self._terraform_common_provider()

        variables_tf = """variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}
"""

        main_tf = """resource "aws_ecs_cluster" "this" {
  name = "infrascribe-ecs-cluster"
}
"""

        outputs_tf = """output "cluster_name" {
  value = aws_ecs_cluster.this.name
}
"""

        return {
            "provider.tf": provider_tf,
            "variables.tf": variables_tf,
            "main.tf": main_tf,
            "outputs.tf": outputs_tf,
        }

    # ---------------------- Monitoring ---------------------- #

    def _generate_monitoring_configs(self) -> Dict[str, str]:
        prometheus_scrape = (
            "scrape_configs:\n"
            "  - job_name: 'infrascribe-app'\n"
            "    static_configs:\n"
            "      - targets: ['app-service.default.svc.cluster.local:5000']\n"
        )

        grafana_dashboard = (
            "{\n"
            '  "title": "InfraScribe App Dashboard",\n'
            '  "panels": []\n'
            "}\n"
        )

        return {
            "prometheus-scrape-config.yaml": prometheus_scrape,
            "grafana-dashboard.json": grafana_dashboard,
        }

    # ---------------------- README.md ---------------------- #

    def _generate_readme(
        self,
        *,
        language: str,
        framework: Optional[str],
        cicd_tool: str,
        deploy_target: str,
        cloud_provider: str,
        infra_preset: str,
        has_dockerfile: bool,
        has_cicd: bool,
        has_k8s: bool,
        has_helm: bool,
        has_argocd: bool,
        has_monitoring: bool,
        has_terraform: bool,
    ) -> str:
        """
        Rule-based README that explains how to use the generated bundle.
        No AI here – just uses the same meta flags we already have.
        """
        lang_label = (language or "app").capitalize()
        fw_label = (framework or "").capitalize() if framework else ""
        stack_label = f"{lang_label} {fw_label}".strip()

        lines: list[str] = []

        lines.append(f"# InfraScribe DevOps Bundle for {stack_label or 'your app'}")
        lines.append("")
        lines.append(
            "This bundle was generated by **InfraScribe** to help you containerize, "
            "build, and deploy your application with a production-style DevOps setup."
        )
        lines.append("")

        # --- Stack + tools overview ---
        lines.append("## Stack and tools")
        lines.append("")
        lines.append(f"- **Application stack:** {stack_label or 'Custom app'}")
        lines.append(f"- **CI/CD:** {cicd_tool}")
        lines.append(f"- **Deploy target:** {deploy_target}")
        lines.append(f"- **Cloud provider:** {cloud_provider}")
        lines.append(f"- **Infra preset:** {infra_preset}")
        lines.append("")

        # --- Contents summary ---
        lines.append("## What this bundle contains")
        lines.append("")
        if has_dockerfile:
            lines.append("- ✅ `Dockerfile` – container image for your app.")
        if has_cicd:
            lines.append("- ✅ CI/CD pipeline (GitHub Actions / Jenkins / GitLab CI).")
        if has_k8s:
            lines.append("- ✅ Kubernetes manifests under `k8s/`.")
        if has_helm:
            lines.append("- ✅ Helm chart under `helm/`.")
        if has_argocd:
            lines.append("- ✅ ArgoCD GitOps apps under `gitops/`.")
        if has_monitoring:
            lines.append("- ✅ Monitoring configs under `monitoring/`.")
        if has_terraform:
            lines.append("- ✅ Terraform infrastructure under `infra/terraform/`.")
        if not any(
            [
                has_dockerfile,
                has_cicd,
                has_k8s,
                has_helm,
                has_argocd,
                has_monitoring,
                has_terraform,
            ]
        ):
            lines.append("- ℹ️ No DevOps assets were generated for this configuration.")
        lines.append("")

        # --- Prerequisites ---
        lines.append("## Prerequisites")
        lines.append("")
        lines.append("- Docker installed locally.")
        lines.append("- A Git repository for your application code.")
        if has_k8s or has_helm or has_argocd:
            lines.append("- A Kubernetes cluster and `kubectl` configured.")
        if has_helm:
            lines.append("- Helm CLI installed.")
        if has_argocd:
            lines.append("- ArgoCD installed and pointed to your Git repo.")
        if has_terraform:
            lines.append("- Terraform CLI installed and AWS credentials configured.")
        lines.append("")

        # --- Using Dockerfile ---
        if has_dockerfile:
            lines.append("## 1. Build and run with Docker")
            lines.append("")
            lines.append("From the project root (where the `Dockerfile` lives):")
            lines.append("")
            lines.append("```bash")
            lines.append("# Build the image")
            lines.append("docker build -t your-dockerhub-user/your-image:latest .")
            lines.append("")
            lines.append("# Run the container")
            lines.append("docker run -p 5000:5000 your-dockerhub-user/your-image:latest")
            lines.append("```")
            lines.append("")

        # --- Using CI/CD ---
        if has_cicd:
            lines.append("## 2. Set up CI/CD")
            lines.append("")
            if cicd_tool == "github_actions":
                lines.append("### GitHub Actions")
                lines.append("")
                lines.append("1. Push this repository to GitHub.")
                lines.append(
                    "2. Add `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` secrets in your GitHub repo."
                )
                lines.append(
                    "3. On every push to `main`, the workflow will build and push the Docker image."
                )
            elif cicd_tool == "jenkins":
                lines.append("### Jenkins pipeline")
                lines.append("")
                lines.append("1. Configure a Jenkins pipeline pointing at this repo.")
                lines.append("2. Add Docker and Docker Hub credentials in Jenkins.")
                lines.append(
                    "3. The pipeline will build and push the image on each run."
                )
            elif cicd_tool == "gitlab_ci":
                lines.append("### GitLab CI")
                lines.append("")
                lines.append("1. Push this repo to GitLab.")
                lines.append(
                    "2. Configure your registry and variables as needed in GitLab."
                )
                lines.append(
                    "3. The pipeline will build and push the image when triggered."
                )
            lines.append("")

        # --- Kubernetes / Helm ---
        if has_k8s or has_helm:
            lines.append("## 3. Deploy to Kubernetes")
            lines.append("")
            lines.append(
                "Make sure your cluster is reachable (`kubectl get nodes` should work)."
            )
            lines.append("")
            if has_k8s:
                lines.append("### Option A – Plain Kubernetes manifests")
                lines.append("")
                lines.append("```bash")
                lines.append("# Apply all manifests in k8s/")
                lines.append("kubectl apply -f k8s/")
                lines.append("```")
                lines.append("")
            if has_helm:
                lines.append("### Option B – Helm chart")
                lines.append("")
                lines.append("```bash")
                lines.append("# Install or upgrade the release")
                lines.append("helm upgrade --install infrascribe-app ./helm")
                lines.append("```")
                lines.append("")

        # --- GitOps / ArgoCD ---
        if has_argocd:
            lines.append("## 4. GitOps with ArgoCD")
            lines.append("")
            lines.append(
                "The `gitops/` folder contains ArgoCD Application definitions for dev/stage/prod "
                "and a root app-of-apps."
            )
            lines.append("")
            lines.append("Typical flow:")
            lines.append("")
            lines.append("1. Push this repo (or infra-only repo) to GitHub/GitLab.")
            lines.append("2. Point ArgoCD at the Git repo and path used in the manifests.")
            lines.append("3. Sync the applications from the ArgoCD UI or CLI.")
            lines.append("")

        # --- Terraform ---
        if has_terraform:
            lines.append("## 5. Provision infrastructure with Terraform")
            lines.append("")
            lines.append("Terraform presets live under `infra/terraform/`:")
            lines.append("- `eks/` – minimal EKS cluster.")
            lines.append("- `ec2/` – EC2 instance to run Docker workloads.")
            lines.append("- `ecs/` – ECS cluster skeleton.")
            lines.append("")
            lines.append("Example usage:")
            lines.append("")
            lines.append("```bash")
            lines.append("cd infra/terraform/eks   # or ec2, ecs")
            lines.append("terraform init")
            lines.append("terraform plan")
            lines.append("terraform apply")
            lines.append("```")
            lines.append("")
            lines.append(
                "> ⚠️ **Warning:** review all Terraform resources and adjust IAM, VPC, and security group settings "
                "before using in a production AWS account."
            )
            lines.append("")

        # --- Monitoring ---
        if has_monitoring:
            lines.append("## 6. Monitoring")
            lines.append("")
            lines.append(
                "The `monitoring/` folder contains starter configs for Prometheus scraping and a basic Grafana dashboard."
            )
            lines.append(
                "You can plug these into your existing Prometheus/Grafana stack and customize as needed."
            )
            lines.append("")

        # --- Final note ---
        lines.append("## Next steps")
        lines.append("")
        lines.append(
            "- Replace placeholder values (image names, AWS ARNs, domain names, etc.)."
        )
        lines.append("- Test everything in a non-production environment first.")
        lines.append(
            "- Gradually harden security, scaling, and observability before real traffic."
        )
        lines.append("")
        lines.append(
            "InfraScribe is meant to give you a **jump start**. "
            "Tweak, delete, or extend any file to match your real-world setup."
        )
        lines.append("")

        return "\n".join(lines)
