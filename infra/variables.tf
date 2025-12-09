<<<<<<< HEAD
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

variable "oci_vcn_cidr" {
  description = "CIDR block for OCI VCN"
  type        = string
  default     = "10.0.0.0/16"
}

variable "oci_subnet_cidr" {
  description = "CIDR block for OCI subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "node_shape" {
  description = "OCI compute shape for worker nodes"
  type        = string
  default     = "VM.Standard.E3.Flex"
}

variable "node_count" {
  description = "Number of worker nodes in the node pool"
  type        = number
  default     = 3
}

variable "node_image_id" {
  description = "OCI image OCID to use for worker nodes (region-specific)"
  type        = string
  default     = ""
=======
variable "region" {
  type    = string
  default = "us-east-1"
>>>>>>> develop
}
