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

# OCI provider is declared in required_providers but not configured here.
# If you need to provision OCI resources (OKE, VCN, etc.), set provision_oci_cluster = true
# and configure OCI credentials via environment variables:
# - TF_VAR_oci_tenancy_ocid
# - TF_VAR_oci_user_ocid
# - TF_VAR_oci_fingerprint
# - TF_VAR_oci_private_key_path
# - TF_VAR_oci_region
# - TF_VAR_oci_compartment_ocid
