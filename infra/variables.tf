variable "kubeconfig_path" {
  description = "Path to kubeconfig file"
  type        = string
  default     = "~/.kube/config"
}

variable "kube_context" {
  description = "Kubernetes context to use"
  type        = string
  default     = "docker-desktop"
}

variable "namespace" {
  description = "Kubernetes namespace"
  type        = string
  default     = "mechanical-workshop"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "workshop-api"
}

variable "app_replicas" {
  description = "Number of application replicas"
  type        = number
  default     = 3
}

variable "database_name" {
  description = "Database name"
  type        = string
  default     = "workshop_db"
}

variable "database_user" {
  description = "Database user"
  type        = string
  default     = "workshop"
}

variable "database_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}

variable "app_image" {
  description = "Docker image for the application"
  type        = string
  default     = "workshop-api:latest"
}

variable "postgres_storage_size" {
  description = "PostgreSQL storage size"
  type        = string
  default     = "10Gi"
}

variable "redis_storage_size" {
  description = "Redis storage size"
  type        = string
  default     = "1Gi"
}
