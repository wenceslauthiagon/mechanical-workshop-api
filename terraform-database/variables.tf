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

variable "server_name" {
  description = "Nome do servidor PostgreSQL"
  type        = string
  default     = "mechanical-workshop-db"
}

variable "database_name" {
  description = "Nome do banco de dados"
  type        = string
  default     = "workshop"
}

variable "admin_username" {
  description = "Username do administrador"
  type        = string
  default     = "workshopadmin"
}

variable "sku_name" {
  description = "SKU do servidor PostgreSQL"
  type        = string
  default     = "GP_Standard_D2s_v3"
}

variable "storage_mb" {
  description = "Tamanho do storage em MB"
  type        = number
  default     = 32768
}

variable "backup_retention_days" {
  description = "Dias de retenção de backup"
  type        = number
  default     = 7
}

variable "geo_redundant_backup_enabled" {
  description = "Habilitar backup geo-redundante"
  type        = bool
  default     = true
}

variable "high_availability_mode" {
  description = "Modo de alta disponibilidade"
  type        = string
  default     = "ZoneRedundant"
}

variable "postgresql_version" {
  description = "Versão do PostgreSQL"
  type        = string
  default     = "14"
}

variable "environment" {
  description = "Ambiente (dev, staging, production)"
  type        = string
  default     = "production"
}

variable "allowed_aks_subnet_id" {
  description = "ID da subnet do AKS para Private Link"
  type        = string
  default     = ""
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
