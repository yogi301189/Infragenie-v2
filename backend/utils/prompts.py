# backend/utils/prompts.py

from typing import Any, Dict


def build_generation_prompt(data: Dict[str, Any]) -> str:
    """
    Build a natural-language prompt for an LLM based on the incoming payload.

    Not yet used in the rule-based version of InfraGenie,
    but this provides a clean place to add AI support later.
    """
    language = data.get("language", "python")
    framework = data.get("framework") or "unknown framework"
    cicd_tool = data.get("cicd_tool", "github_actions")
    deploy_target = data.get("deploy_target", "kubernetes")
    cloud_provider = data.get("cloud_provider", "aws")
    extra_context = data.get("extra_context") or ""

    prompt = f"""
You are an expert DevOps engineer and platform architect.

Generate the following for an application:
- Language: {language}
- Framework: {framework}
- CI/CD Tool: {cicd_tool}
- Deploy Target: {deploy_target}
- Cloud Provider: {cloud_provider}

User context / description:
{extra_context}

You must output:
1) A Dockerfile
2) A CI/CD configuration
3) Kubernetes manifests or a Helm chart (depending on deploy target)
4) Optional ArgoCD Application manifest for GitOps
5) Optional Prometheus scrape config and Grafana dashboard JSON

Make sure all YAML is valid and consistent.
"""
    return prompt.strip()
