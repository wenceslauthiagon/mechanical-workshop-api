output "namespace" {
  description = "Kubernetes namespace"
  value       = kubernetes_namespace.workshop.metadata[0].name
}

output "postgres_service" {
  description = "PostgreSQL service name"
  value       = kubernetes_service.postgres.metadata[0].name
}

output "redis_service" {
  description = "Redis service name"
  value       = kubernetes_service.redis.metadata[0].name
}

output "api_service" {
  description = "API service name"
  value       = kubernetes_service.workshop_api.metadata[0].name
}

output "api_service_type" {
  description = "API service type"
  value       = kubernetes_service.workshop_api.spec[0].type
}

output "api_endpoint" {
  description = "API external endpoint (when LoadBalancer is ready)"
  value       = "Check with: kubectl get svc ${kubernetes_service.workshop_api.metadata[0].name} -n ${kubernetes_namespace.workshop.metadata[0].name}"
}
