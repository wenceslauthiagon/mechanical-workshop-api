variable "resource_group_name" {
  description = "Nome do Resource Group"
  type        = string
  default     = "mechanical-workshop-rg"
}

variable "location" {
  description = "Localização dos recursos Azure"
  type        = string
  default     = "East US"
}

variable "cluster_name" {
  description = "Nome do cluster AKS"
  type        = string
  default     = "mechanical-workshop-aks"
}

variable "kubernetes_version" {
  description = "Versão do Kubernetes"
  type        = string
  default     = "1.28.3"
}

variable "node_count" {
  description = "Número de nodes no pool padrão"
  type        = number
  default     = 2
}

variable "node_vm_size" {
  description = "Tamanho da VM dos nodes"
  type        = string
  default     = "Standard_D2s_v3"
}

variable "min_node_count" {
  description = "Número mínimo de nodes no auto-scaling"
  type        = number
  default     = 2
}

variable "max_node_count" {
  description = "Número máximo de nodes no auto-scaling"
  type        = number
  default     = 10
}

variable "environment" {
  description = "Ambiente (dev, staging, production)"
  type        = string
  default     = "production"
}

variable "tags" {
  description = "Tags para os recursos"
  type        = map(string)
  default = {
    project     = "mechanical-workshop"
    managed_by  = "terraform"
    cost_center = "engineering"
  }
}
