# backend/services/ai_generation_service.py

from openai import OpenAI
from utils.logger import get_logger

logger = get_logger(__name__)
client = OpenAI()

class AIGenerationService:

    async def generate_bundle(self, payload):
        """
        The heart of AI Thick-Mode.

        Takes the user's entire stack description and asks OpenAI to create
        a full DevOps bundle — Dockerfile, CI/CD, K8s, Helm, GitOps, Terraform,
        README, etc.
        """

        user_context = self._build_prompt(payload)

        try:
            response = client.responses.create(
                model="gpt-4.1",
                temperature=0.25,
                response_format={
                    "type": "json_schema",
                    "json_schema": self._schema()
                },
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are InfraGenie AI Pro Mode — an expert DevOps, SRE, "
                            "platform engineering and Kubernetes automation assistant. "
                            "Generate production-quality configurations, not toy examples."
                        )
                    },
                    {
                        "role": "user",
                        "content": user_context
                    }
                ]
            )

            result = response.output_json
            logger.info("AI Thick Mode result received.")

            return self._normalize_output(result)

        except Exception as e:
            logger.exception("AI Thick Mode failed — falling back to rule-based.")
            return None  # backend will fallback automatically

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
                "helm": {"type": "object"
