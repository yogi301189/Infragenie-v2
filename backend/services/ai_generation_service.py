# backend/services/ai_generation_service.py

import json
from typing import Any, Dict, Optional

from openai import OpenAI
from utils.logger import get_logger

logger = get_logger(__name__)
client = OpenAI()


class AIGenerationService:
    """
    Handles AI-based DevOps bundle generation.
    AI output is ALWAYS normalized to match rule-based GenerateResponse.
    """

    # -------------------------------------------------
    # PUBLIC ENTRY
    # -------------------------------------------------

    async def generate_bundle(self, payload) -> Optional[Dict[str, Any]]:
        prompt = self._build_prompt(payload)

        try:
            response = client.responses.create(
                model="gpt-4.1",
                input=prompt,
            )
        except Exception:
            logger.exception("AI request failed")
            return None

        text = response.output_text

        try:
            ai_json = json.loads(text)
        except json.JSONDecodeError:
            logger.error("AI returned non-JSON output")
            logger.debug(text)
            return None

        try:
            normalized = self._normalize_output(ai_json)
            return normalized
        except Exception:
            logger.exception("Failed to normalize AI output")
            return None

    # -------------------------------------------------
    # PROMPT BUILDER
    # -------------------------------------------------

    def _build_prompt(self, payload) -> str:
        """
        Hard-restricted system prompt.
        Forces JSON-only output matching rule-based response.
        """
        return f"""
You are a backend API.

You MUST return ONLY valid JSON.
NO markdown.
NO explanations.
NO comments.
NO trailing text.
NO backticks.

If the output is not strict JSON, it will be rejected.

Return EXACTLY this structure:

{{
  "dockerfile": "string",

  "cicd": "string | null",

  "k8s": {{
    "deployment.yaml": "string",
    "service.yaml": "string"
  }} | null,

  "helm": {{
    "Chart.yaml": "string",
    "values.yaml": "string",
    "templates": {{
      "deployment.yaml": "string",
      "service.yaml": "string"
    }}
  }} | null,

  "argocd": {{
    "app.yaml": "string"
  }} | null,

  "monitoring": {{
    "prometheus.yaml": "string",
    "grafana.json": "string"
  }} | null,

  "terraform": {{
    "stack_name": {{
      "provider.tf": "string",
      "main.tf": "string",
      "variables.tf": "string",
      "outputs.tf": "string"
    }}
  }} | null,

  "readme_md": "string"
}}

Generate a DevOps bundle for:

Language: {payload.language}
Framework: {payload.framework}
CI/CD tool: {payload.cicd_tool}
Deploy target: {payload.deploy_target}
Cloud provider: {payload.cloud_provider}
Infra preset: {payload.infra_preset}
Include GitOps: {payload.include_gitops}
Include Monitoring: {payload.include_monitoring}

REMEMBER:
RETURN JSON ONLY.
"""

    # -------------------------------------------------
    # NORMALIZER (CRITICAL)
    # -------------------------------------------------

    def _normalize_output(self, ai: Dict[str, Any]) -> Dict[str, Any]:
        """
        Converts AI JSON into the EXACT structure produced by rule-based generator.
        This guarantees GenerateResponse validation passes.
        """

        # ---- CI/CD ----
        cicd_content = ai.get("cicd")

        # ---- Kubernetes ----
        k8s_manifests = ai.get("k8s") if isinstance(ai.get("k8s"), dict) else None

        # ---- Helm: flatten to Dict[str, str] ----
        helm_chart = None
        helm = ai.get("helm")
        if isinstance(helm, dict):
            helm_chart = {}
            for key, value in helm.items():
                if isinstance(value, dict):
                    for fname, content in value.items():
                        helm_chart[f"{key}/{fname}"] = str(content)
                else:
                    helm_chart[key] = str(value)

        # ---- ArgoCD: Dict[str, str] ----
        argocd_app = None
        argocd = ai.get("argocd")
        if isinstance(argocd, dict):
            argocd_app = {
                name: str(content) for name, content in argocd.items()
            }

        # ---- Terraform: Dict[str, Dict[str, str]] ----
        terraform_configs = None
        terraform = ai.get("terraform")
        if isinstance(terraform, dict):
            terraform_configs = {}
            for stack, files in terraform.items():
                if isinstance(files, dict):
                    terraform_configs[stack] = {
                        fname: str(body) for fname, body in files.items()
                    }
                else:
                    terraform_configs[stack] = {"main.tf": str(files)}

        return {
            "dockerfile": ai.get("dockerfile"),

            "cicd_config": cicd_content,
            "cicd_meta": {
                "filename": "pipeline.yaml",
                "content": cicd_content,
            } if cicd_content else None,

            "k8s_manifests": k8s_manifests,
            "helm_chart": helm_chart,
            "argocd_app": argocd_app,
            "monitoring_configs": ai.get("monitoring"),
            "terraform_configs": terraform_configs,

            "raw": {"ai_mode": True},
            "readme_md": ai.get("readme_md") or "# AI README\n(No README provided)",
        }
