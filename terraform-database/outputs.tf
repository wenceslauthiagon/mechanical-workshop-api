output "server_id" {
  description = "ID do servidor PostgreSQL"
  value       = azurerm_postgresql_flexible_server.main.id
}

output "server_fqdn" {
  description = "FQDN do servidor PostgreSQL"
  value       = azurerm_postgresql_flexible_server.main.fqdn
}

output "database_name" {
  description = "Nome do banco de dados"
  value       = azurerm_postgresql_flexible_server_database.main.name
}

output "admin_username" {
  description = "Username do administrador"
  value       = var.admin_username
}

output "admin_password" {
  description = "Senha do administrador"
  value       = random_password.admin_password.result
  sensitive   = true
}

output "connection_string" {
  description = "Connection string PostgreSQL"
  value       = "postgresql://${var.admin_username}:${random_password.admin_password.result}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/${var.database_name}?schema=public&sslmode=require"
  sensitive   = true
}

output "key_vault_id" {
  description = "ID do Key Vault"
  value       = azurerm_key_vault.main.id
}

output "log_analytics_workspace_id" {
  description = "ID do Log Analytics Workspace"
  value       = azurerm_log_analytics_workspace.main.id
}
