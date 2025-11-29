# backend/routers/generate.py

from typing import Optional, Dict, Any

from fastapi import APIRouter, HTTPException, Body
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import io
import zipfile
import os
from openai import OpenAI  # use the same client lib you're already using

client = OpenAI()

from services.generation_service import GenerationService
from utils.logger import get_logger
from utils.zip_builder import build_zip_from_result

router = APIRouter()
logger = get_logger(__name__)
generation_service = GenerationService()


class GenerateRequest(BaseModel):
    """
    Payload from frontend describing what InfraGenie should generate.
    """
    language: str                       # e.g. "python", "node", "java"
    framework: Optional[str] = None     # e.g. "flask", "express", "spring"
    repo_url: Optional[str] = None      # optional GitHub repo for context (future use)
    cicd_tool: str = "github_actions"   # "github_actions" | "jenkins" | "gitlab_ci"
    deploy_target: str = "kubernetes"   # "kubernetes" | "helm"
    cloud_provider: Optional[str] = "aws"   # "aws" | "gcp" | "azure" | None
    include_gitops: bool = True
    include_monitoring: bool = False
    infra_preset: Optional[str] = "all"     # "eks" | "ec2-k3s" | "ecs-fargate" | "all" | "none"
    extra_context: Optional[str] = None     # free-text description of the app
    

class GenerateResponse(BaseModel):
    """
    Structured response with all generated artefacts.
    """
    dockerfile: Optional[str] = None
    cicd_config: Optional[str] = None              # string for API
    cicd_meta: Optional[Dict[str, Any]] = None     # filename + content for ZIP
    k8s_manifests: Optional[Dict[str, str]] = None
    helm_chart: Optional[Dict[str, str]] = None
    argocd_app: Optional[Dict[str, str]] = None    # dict of app-dev.yaml, etc.
    monitoring_configs: Optional[Dict[str, str]] = None
    terraform_configs: Optional[Dict[str, Dict[str, str]]] = None
    raw: Optional[Dict[str, Any]] = None
    explanation: Optional[str] = None


class BundlePayload(BaseModel):
    """
    Shape of data posted from frontend to /download-zip.
    Should match GenerateResponse so you can paste the output directly.
    """
    dockerfile: Optional[str] = None
    cicd_config: Optional[str] = None
    cicd_meta: Optional[Dict[str, Any]] = None
    k8s_manifests: Optional[Dict[str, str]] = None
    helm_chart: Optional[Dict[str, str]] = None
    argocd_app: Optional[Dict[str, str]] = None
    monitoring_configs: Optional[Dict[str, str]] = None
    terraform_configs: Optional[Dict[str, Dict[str, str]]] = None
    raw: Optional[Dict[str, Any]] = None

class ExplainRequest(BaseModel):
    filename: str
    content: str
    label: Optional[str] = None
    stack: Optional[str] = None  # optional extra context (language/framework)



class ExplainResponse(BaseModel):

    explanation: str

class RefineRequest(BaseModel):
    filename: str
    content: str          # current file content
    instructions: str     # what the user wants to change
    label: Optional[str] = None
    stack: Optional[str] = None  # optional context (language/framework)


class RefineResponse(BaseModel):
    updated_content: str




@router.post("/download-zip")
def download_zip(bundle: BundlePayload = Body(...)):
    """
    Take the generation result JSON and return a ZIP file.
    This is used when the frontend wants to build the ZIP itself and send it.
    """
    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        # Dockerfile
        if bundle.dockerfile:
            zf.writestr("Dockerfile", bundle.dockerfile)

        # CI/CD
        if bundle.cicd_meta:
            filename = bundle.cicd_meta.get("filename", "pipeline.yaml")
            content = bundle.cicd_meta.get("content", "") or ""
            zf.writestr(f"ci-cd/{filename}", content)
        elif bundle.cicd_config:
            zf.writestr("ci-cd/pipeline.yaml", bundle.cicd_config)

        # K8s
        if bundle.k8s_manifests:
            for filename, content in bundle.k8s_manifests.items():
                zf.writestr(f"k8s/{filename}", content)

        # Helm
        if bundle.helm_chart:
            for filename, content in bundle.helm_chart.items():
                zf.writestr(f"helm/{filename}", content)

        # ArgoCD / GitOps
        if bundle.argocd_app:
            for filename, content in bundle.argocd_app.items():
                zf.writestr(f"gitops/{filename}", content)

        # Monitoring
        if bundle.monitoring_configs:
            for filename, content in bundle.monitoring_configs.items():
                zf.writestr(f"monitoring/{filename}", content)

        # Terraform
        if bundle.terraform_configs:
            for group, files in bundle.terraform_configs.items():
                for filename, content in files.items():
                    zf.writestr(f"infra/terraform/{group}/{filename}", content)

        # Raw meta (optional)
        if bundle.raw:
            import json
            zf.writestr("meta.json", json.dumps(bundle.raw, indent=2))

    zip_buffer.seek(0)

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": 'attachment; filename="infragenie-bundle.zip"'
        },
    )


@router.post("/", response_model=GenerateResponse)
async def generate_infra(payload: GenerateRequest) -> GenerateResponse:
    """
    Main InfraGenie endpoint – returns JSON with all configs.
    """
    try:
        logger.info(
            "Generation request received",
            extra={
                "language": payload.language,
                "framework": payload.framework,
                "cicd_tool": payload.cicd_tool,
                "deploy_target": payload.deploy_target,
            },
        )

        result_dict = await generation_service.generate(payload)
        return GenerateResponse(**result_dict)

    except ValueError as e:
        logger.warning(f"Bad request for generate_infra: {e}")
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        logger.exception("Unexpected error in generate_infra")
        raise HTTPException(
            status_code=500,
            detail="Internal server error while generating infrastructure config.",
        )
@router.post("/explain", response_model=ExplainResponse)
def explain_file(req: ExplainRequest):
    """
    Return a human-friendly explanation for a generated file.
    Always returns 200 with either an explanation or a graceful error message.
    """
    if not req.content.strip():
        # Don't throw 400, just explain why there's no explanation
        return ExplainResponse(
            explanation="This file is empty, so there is nothing to explain yet."
        )

    user_prompt = f"""
You are InfraGenie, a DevOps assistant. Explain the following file to a developer
in clear, concise language.

File name: {req.filename}
Label: {req.label or ""}

File content:
----------------
{req.content}
----------------

Explain in this structure:
1. Purpose – 2–4 sentences describing what this file does.
2. Key settings – bullet points for the most important fields and what they control.
3. Safe edits – bullet points for things the user can safely tweak (like replicas, image tag, resource limits, regions, ports).
4. Cautions – bullet points for things they should be careful about before changing.

Use Markdown-style bullets and short paragraphs.
"""

    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a DevOps expert who explains config files in simple language.",
                },
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
        )

        explanation_text = (completion.choices[0].message.content or "").strip()

        if not explanation_text:
            # Model responded but with empty content
            return ExplainResponse(
                explanation=(
                    "InfraGenie tried to generate an explanation, "
                    "but the AI returned an empty response. "
                    "Please try again in a moment."
                )
            )

        return ExplainResponse(explanation=explanation_text)

    except Exception as e:
        # Log full stack trace for you in Render logs
        logger.exception("Explain error")

        # But never throw 500 to the frontend – send a human-friendly message instead
        return ExplainResponse(
            explanation=(
                "InfraGenie couldn't generate an AI explanation right now.\n\n"
                "This is usually due to a temporary AI service or configuration issue.\n"
                "If you are the developer, check the backend logs on Render for details:\n"
                f"{type(e).__name__}: {e}"
            )
        )


@router.post("/bundle")
async def generate_infra_bundle(payload: GenerateRequest):
    """
    Same as /api/generate, but returns a ZIP file containing all generated artefacts.

    Frontend can call this to offer a "Download as ZIP" button.
    """
    try:
        logger.info(
            "Generation (ZIP bundle) request received",
            extra={
                "language": payload.language,
                "framework": payload.framework,
                "cicd_tool": payload.cicd_tool,
                "deploy_target": payload.deploy_target,
            },
        )

        result_dict = await generation_service.generate(payload)
        zip_buffer = build_zip_from_result(result_dict)

        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={
                "Content-Disposition": 'attachment; filename="infragenie-bundle.zip"'
            },
        )

    except ValueError as e:
        logger.warning(f"Bad request for generate_infra_bundle: {e}")
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        logger.exception("Unexpected error in generate_infra_bundle")
        raise HTTPException(
            status_code=500,
            detail="Internal server error while generating bundle.",
        )
