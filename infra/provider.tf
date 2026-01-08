terraform {
  required_version = ">= 1.0"
  
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
    oci = {
      source  = "oracle/oci"
      version = "~> 4.0"
    }
  }

  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "kubernetes" {
  config_path    = var.kubeconfig_path != "" ? var.kubeconfig_path : null
  config_context = var.kube_context != "" ? var.kube_context : null
}

provider "helm" {
  kubernetes {
    config_path    = var.kubeconfig_path != "" ? var.kubeconfig_path : null
    config_context = var.kube_context != "" ? var.kube_context : null
  }
}

# Optional OCI provider configuration. Set `provision_oci_cluster = true` and
# provide the OCI variables in `terraform.tfvars` or via environment variables
# to enable provisioning of OCI resources (OKE, VCN, etc.).
provider "oci" {
  tenancy_ocid     = var.oci_tenancy_ocid != "" ? var.oci_tenancy_ocid : null
  user_ocid        = var.oci_user_ocid != "" ? var.oci_user_ocid : null
  fingerprint      = var.oci_fingerprint != "" ? var.oci_fingerprint : null
  private_key_path = var.oci_private_key_path != "" && var.oci_private_key_path != "~/.oci/oci_api_key.pem" ? var.oci_private_key_path : null
  region           = var.oci_region != "" ? var.oci_region : null
}
