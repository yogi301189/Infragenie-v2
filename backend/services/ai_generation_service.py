# backend/services/ai_generation_service.py

import json
from openai import OpenAI
from utils.logger import get_logger

logger = get_logger(__name__)
client = OpenAI()


class AIGenerationService:
    async def generate_bundle(self, payload):
        prompt = self._build_prompt(payload)

        response = client.responses.create(
            model="gpt-4.1",
            input=prompt,
        )

        text = response.output_text

        try:
            data = json.loads(text)
            return data
        except json.JSONDecodeError:
            logger.error("AI returned non-JSON output")
            logger.debug(text)
            return None


    # -------------------------------------------------
    # PROMPT BUILDER
    # -------------------------------------------------

    def _build_prompt(self, payload):
        """
        Builds a rich text prompt describing the stack.
        """
        return f"""
Generate a complete production-ready DevOps bundle for this application.

App stack:
- Language: {payload.language}
- Framework: {payload.framework}
- CI/CD: {payload.cicd_tool}
- Deploy target: {payload.deploy_target}
- Cloud provider: {payload.cloud_provider}
- Infrastructure preset: {payload.infra_preset}
- GitOps: {payload.include_gitops}
- Monitoring: {payload.include_monitoring}

Extra context:
{payload.extra_context or "None"}

Requirements:
- All output MUST strictly follow the JSON schema.
- Use real-world best practices, not toy examples.
- Use placeholders like <AWS_ACCOUNT_ID>, <IMAGE>, <REPO>.
- Ensure Terraform modules are minimal but working.
- README must be polished, human-friendly, structured.
- No additional prose outside the JSON.
"""

    # -------------------------------------------------
    # JSON SCHEMA FOR STRUCTURED AI OUTPUT
    # -------------------------------------------------

    def _schema(self):
        """
        JSON schema describing the AI output format.
        Must match existing GenerateResponse structure.
        """
        return {
            "type": "object",
            "properties": {
                "dockerfile": {"type": "string"},
                "cicd": {"type": "string"},
                "k8s": {"type": "object"},
                "helm": {"type": "object"},
                "argocd": {"type": "object"},
                "monitoring": {"type": "object"},
                "terraform": {"type": "object"},
                "readme_md": {"type": "string"}
            },
            "required": ["dockerfile"]
        }

    # -------------------------------------------------
    # NORMALIZE AI OUTPUT TO MATCH RULE-BASED STRUCTURE
    # -------------------------------------------------

    def _normalize_output(self, ai):
        """
        Converts AI JSON into the exact shape the frontend expects.
        """
        return {
            "dockerfile": ai.get("dockerfile"),
            "cicd_config": ai.get("cicd"),
            "cicd_meta": {
                "filename": "pipeline.yaml",
                "content": ai.get("cicd")
            } if ai.get("cicd") else None,

            "k8s_manifests": ai.get("k8s"),
            "helm_chart": ai.get("helm"),
            "argocd_app": ai.get("argocd"),
            "monitoring_configs": ai.get("monitoring"),
            "terraform_configs": ai.get("terraform"),

            "raw": {"ai_mode": True},
            "readme_md": ai.get("readme_md", "# AI README\n(No README provided)")
        }
