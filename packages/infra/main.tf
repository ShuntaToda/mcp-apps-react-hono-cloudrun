terraform {
  required_version = ">= 1.5"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# --- API有効化 ---

resource "google_project_service" "run" {
  service            = "run.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "artifactregistry" {
  service            = "artifactregistry.googleapis.com"
  disable_on_destroy = false
}

# --- Artifact Registry ---

resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = var.service_name
  format        = "DOCKER"

  depends_on = [google_project_service.artifactregistry]
}

# --- Cloud Run サービス ---

locals {
  image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.repository_id}/${var.service_name}:latest"
}

resource "google_cloud_run_v2_service" "mcp" {
  name     = var.service_name
  location = var.region

  deletion_protection = false

  template {
    containers {
      image = local.image

      ports {
        container_port = 8080
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }

      env {
        name  = "SERVICE_URL"
        value = var.service_url
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 3
    }
  }

  depends_on = [google_project_service.run]
}

# --- 未認証アクセスを許可 ---

resource "google_cloud_run_v2_service_iam_member" "public" {
  project  = google_cloud_run_v2_service.mcp.project
  location = google_cloud_run_v2_service.mcp.location
  name     = google_cloud_run_v2_service.mcp.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# --- Outputs ---

output "service_url" {
  value       = google_cloud_run_v2_service.mcp.uri
  description = "Cloud Run service URL"
}

output "mcp_endpoint" {
  value       = "${google_cloud_run_v2_service.mcp.uri}/mcp"
  description = "MCP Streamable HTTP endpoint"
}

output "image" {
  value       = local.image
  description = "Container image URI"
}
