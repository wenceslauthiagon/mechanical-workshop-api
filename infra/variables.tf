variable "kubeconfig_path" {
  description = "Path to kubeconfig file (empty string uses in-cluster config)"
  type        = string
  default     = ""
}

variable "kube_context" {
  description = "Kubernetes context to use (empty string uses current context)"
  type        = string
  default     = ""
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

variable "provision_oci_cluster" {
  description = "If true, enable OCI provider resources (OKE)."
  type        = bool
  default     = false
}

variable "oci_tenancy_ocid" {
  description = "OCI tenancy OCID"
  type        = string
  default     = ""
}

variable "oci_user_ocid" {
  description = "OCI user OCID"
  type        = string
  default     = ""
}

variable "oci_fingerprint" {
  description = "OCI API key fingerprint"
  type        = string
  default     = ""
}

variable "oci_private_key_path" {
  description = "Path to OCI API private key file (can be relative to working dir)"
  type        = string
  default     = "~/.oci/oci_api_key.pem"
}

variable "oci_region" {
  description = "OCI region to provision resources"
  type        = string
  default     = "us-ashburn-1"
}

variable "oci_compartment_ocid" {
  description = "OCI compartment OCID where resources will be created"
  type        = string
  default     = ""
}
