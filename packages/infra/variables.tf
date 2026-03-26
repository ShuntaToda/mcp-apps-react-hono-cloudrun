variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region for Cloud Run"
  type        = string
  default     = "asia-northeast1"
}

variable "service_name" {
  description = "Cloud Run service name"
  type        = string
  default     = "shop-mcp"
}

variable "service_url" {
  description = "Cloud Run service URL (set after first deploy)"
  type        = string
  default     = ""
}
