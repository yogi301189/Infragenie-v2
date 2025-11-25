# backend/utils/zip_builder.py

import io
import zipfile
from pathlib import Path
from typing import Dict, Any, Optional

BASE_DIR = Path(__file__).resolve().parent.parent  # backend/
DOCS_TEMPLATE_DIR = BASE_DIR / "templates" / "docs"


def build_zip_from_result(result: Dict[str, Any]) -> io.BytesIO:
    """
    Builds a ZIP bundle based on the generation output.
    """
    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        dockerfile: Optional[str] = result.get("dockerfile")
        cicd_meta: Optional[Dict[str, Any]] = result.get("cicd_meta")
        k8s_manifests: Optional[Dict[str, str]] = result.get("k8s_manifests")
        helm_chart: Optional[Dict[str, str]] = result.get("helm_chart")
        argocd_apps: Optional[Dict[str, str]] = result.get("argocd_app")
        terraform_configs: Optional[Dict[str, Dict[str, str]]] = result.get("terraform_configs")
        monitoring_configs: Optional[Dict[str, str]] = result.get("monitoring_configs")

        # ------------------- Dockerfile -------------------
        if dockerfile:
            zf.writestr("Dockerfile", dockerfile)

        # ------------------- CI/CD ------------------------
        if cicd_meta:
            filename = cicd_meta.get("filename", "pipeline.yaml")
            content = cicd_meta.get("content", "") or ""
            zf.writestr(f"ci-cd/{filename}", content)
        else:
            cicd_str = result.get("cicd_config")
            if isinstance(cicd_str, str) and cicd_str.strip():
                zf.writestr("ci-cd/pipeline.yaml", cicd_str)

        # ------------------- K8s --------------------------
        if k8s_manifests:
            for filename, content in k8s_manifests.items():
                zf.writestr(f"k8s/{filename}", content)

        # ------------------- Helm -------------------------
        if helm_chart:
            for filename, content in helm_chart.items():
                zf.writestr(f"helm/{filename}", content)

        # ------------------- GitOps (ArgoCD) --------------
        if argocd_apps:
            for filename, content in argocd_apps.items():
                zf.writestr(f"gitops/{filename}", content)

        # ------------------- Monitoring -------------------
        if monitoring_configs:
            for filename, content in monitoring_configs.items():
                zf.writestr(f"monitoring/{filename}", content)
        # ------------------- Terraform --------------------
        # Structure: terraform_configs = { "eks": {...}, "ec2": {...}, "ecs": {...} }
        if terraform_configs:
            for preset, files in terraform_configs.items():
                for filename, content in files.items():
                    zf.writestr(f"infra/terraform/{preset}/{filename}", content)


        # ------------------- PRODUCTION.md ----------------
        prod_md_path = DOCS_TEMPLATE_DIR / "PRODUCTION.md"
        if prod_md_path.exists():
            zf.writestr(
                "docs/PRODUCTION.md",
                prod_md_path.read_text(encoding="utf-8"),
            )

        # ------------------- Diagrams ---------------------
        for fname in ["architecture-diagram.png", "pipeline-sequence.png"]:
            fpath = DOCS_TEMPLATE_DIR / fname
            if fpath.exists():
                zf.write(fpath, arcname=f"docs/{fname}")

        # ------------------- README -----------------------
        readme = (
            "# InfraGenie Bundle\n\n"
            "This ZIP was generated automatically by InfraGenie.\n\n"
            "## Contains (depending on your options):\n"
            "- Dockerfile\n"
            "- ci-cd/* (GitHub Actions / Jenkinsfile / GitLab CI)\n"
            "- k8s/*.yaml\n"
            "- helm/* (if Helm selected)\n"
            "- gitops/*.yaml (if GitOps enabled)\n"
            "- monitoring/* (if monitoring enabled)\n"
            "- docs/PRODUCTION.md (if present)\n"
            "- docs/*.png (architecture / pipeline diagrams, if present)\n"
        )
        zf.writestr("README-INFRAGENIE.md", readme)

    zip_buffer.seek(0)
    return zip_buffer
