resource "kubernetes_namespace" "workshop" {
  metadata {
    name = var.namespace
    labels = {
      name        = var.namespace
      environment = "production"
      managed_by  = "terraform"
    }
  }
}

resource "kubernetes_config_map" "workshop_config" {
  metadata {
    name      = "workshop-config"
    namespace = kubernetes_namespace.workshop.metadata[0].name
  }

  data = {
    NODE_ENV       = "production"
    PORT           = "3000"
    DATABASE_HOST  = "postgres-service"
    DATABASE_PORT  = "5432"
    DATABASE_NAME  = var.database_name
    DATABASE_USER  = var.database_user
    REDIS_HOST     = "redis-service"
    REDIS_PORT     = "6379"
    JWT_EXPIRATION = "24h"
  }
}

resource "kubernetes_secret" "workshop_secrets" {
  metadata {
    name      = "workshop-secrets"
    namespace = kubernetes_namespace.workshop.metadata[0].name
  }

  type = "Opaque"

  data = {
    DATABASE_PASSWORD = base64encode(var.database_password)
    JWT_SECRET        = base64encode(var.jwt_secret)
    DATABASE_URL      = base64encode("postgresql://${var.database_user}:${var.database_password}@postgres-service:5432/${var.database_name}?schema=public")
  }
}

resource "kubernetes_persistent_volume_claim" "postgres_pvc" {
  metadata {
    name      = "postgres-pvc"
    namespace = kubernetes_namespace.workshop.metadata[0].name
  }

  spec {
    access_modes = ["ReadWriteOnce"]
    
    resources {
      requests = {
        storage = var.postgres_storage_size
      }
    }

    storage_class_name = "standard"
  }

  wait_until_bound = false
}

resource "kubernetes_persistent_volume_claim" "redis_pvc" {
  metadata {
    name      = "redis-pvc"
    namespace = kubernetes_namespace.workshop.metadata[0].name
  }

  spec {
    access_modes = ["ReadWriteOnce"]
    
    resources {
      requests = {
        storage = var.redis_storage_size
      }
    }

    storage_class_name = "standard"
  }

  wait_until_bound = false
}

resource "kubernetes_deployment" "postgres" {
  metadata {
    name      = "postgres"
    namespace = kubernetes_namespace.workshop.metadata[0].name
    labels = {
      app  = "postgres"
      tier = "database"
    }
  }

  wait_for_rollout = false

  timeouts {
    create = "5m"
    update = "5m"
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "postgres"
      }
    }

    template {
      metadata {
        labels = {
          app  = "postgres"
          tier = "database"
        }
      }

      spec {
        container {
          name  = "postgres"
          image = "postgres:16-alpine"

          port {
            container_port = 5432
            name           = "postgres"
          }

          env {
            name = "POSTGRES_DB"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.workshop_config.metadata[0].name
                key  = "DATABASE_NAME"
              }
            }
          }

          env {
            name = "POSTGRES_USER"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.workshop_config.metadata[0].name
                key  = "DATABASE_USER"
              }
            }
          }

          env {
            name = "POSTGRES_PASSWORD"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.workshop_secrets.metadata[0].name
                key  = "DATABASE_PASSWORD"
              }
            }
          }

          volume_mount {
            name       = "postgres-storage"
            mount_path = "/var/lib/postgresql/data"
          }

          resources {
            requests = {
              cpu    = "250m"
              memory = "512Mi"
            }
            limits = {
              cpu    = "500m"
              memory = "1Gi"
            }
          }

          liveness_probe {
            exec {
              command = ["pg_isready", "-U", var.database_user]
            }
            initial_delay_seconds = 30
            period_seconds        = 10
            timeout_seconds       = 5
          }

          readiness_probe {
            exec {
              command = ["pg_isready", "-U", var.database_user]
            }
            initial_delay_seconds = 5
            period_seconds        = 10
            timeout_seconds       = 5
          }
        }

        volume {
          name = "postgres-storage"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.postgres_pvc.metadata[0].name
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "postgres" {
  metadata {
    name      = "postgres-service"
    namespace = kubernetes_namespace.workshop.metadata[0].name
    labels = {
      app = "postgres"
    }
  }

  spec {
    type = "ClusterIP"

    port {
      port        = 5432
      target_port = 5432
      protocol    = "TCP"
      name        = "postgres"
    }

    selector = {
      app = "postgres"
    }
  }
}

resource "kubernetes_deployment" "redis" {
  metadata {
    name      = "redis"
    namespace = kubernetes_namespace.workshop.metadata[0].name
    labels = {
      app  = "redis"
      tier = "cache"
    }
  }

  wait_for_rollout = false

  timeouts {
    create = "5m"
    update = "5m"
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "redis"
      }
    }

    template {
      metadata {
        labels = {
          app  = "redis"
          tier = "cache"
        }
      }

      spec {
        container {
          name  = "redis"
          image = "redis:7-alpine"

          port {
            container_port = 6379
            name           = "redis"
          }

          volume_mount {
            name       = "redis-storage"
            mount_path = "/data"
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "128Mi"
            }
            limits = {
              cpu    = "200m"
              memory = "256Mi"
            }
          }

          liveness_probe {
            exec {
              command = ["redis-cli", "ping"]
            }
            initial_delay_seconds = 30
            period_seconds        = 10
            timeout_seconds       = 5
          }

          readiness_probe {
            exec {
              command = ["redis-cli", "ping"]
            }
            initial_delay_seconds = 5
            period_seconds        = 10
            timeout_seconds       = 5
          }
        }

        volume {
          name = "redis-storage"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.redis_pvc.metadata[0].name
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "redis" {
  metadata {
    name      = "redis-service"
    namespace = kubernetes_namespace.workshop.metadata[0].name
    labels = {
      app = "redis"
    }
  }

  spec {
    type = "ClusterIP"

    port {
      port        = 6379
      target_port = 6379
      protocol    = "TCP"
      name        = "redis"
    }

    selector = {
      app = "redis"
    }
  }
}

resource "kubernetes_deployment" "workshop_api" {
  metadata {
    name      = var.app_name
    namespace = kubernetes_namespace.workshop.metadata[0].name
    labels = {
      app  = var.app_name
      tier = "backend"
    }
  }

  wait_for_rollout = false

  timeouts {
    create = "5m"
    update = "5m"
  }

  spec {
    replicas = var.app_replicas

    selector {
      match_labels = {
        app = var.app_name
      }
    }

    strategy {
      type = "RollingUpdate"
      rolling_update {
        max_surge       = "1"
        max_unavailable = "0"
      }
    }

    template {
      metadata {
        labels = {
          app  = var.app_name
          tier = "backend"
        }
      }

      spec {
        container {
          name              = var.app_name
          image             = var.app_image
          image_pull_policy = "Always"

          port {
            container_port = 3000
            name           = "http"
          }

          env_from {
            config_map_ref {
              name = kubernetes_config_map.workshop_config.metadata[0].name
            }
          }

          env_from {
            secret_ref {
              name = kubernetes_secret.workshop_secrets.metadata[0].name
            }
          }

          resources {
            requests = {
              cpu    = "200m"
              memory = "256Mi"
            }
            limits = {
              cpu    = "500m"
              memory = "512Mi"
            }
          }

          liveness_probe {
            http_get {
              path = "/health"
              port = 3000
            }
            initial_delay_seconds = 60
            period_seconds        = 10
            timeout_seconds       = 5
            failure_threshold     = 3
          }

          readiness_probe {
            http_get {
              path = "/health"
              port = 3000
            }
            initial_delay_seconds = 30
            period_seconds        = 10
            timeout_seconds       = 5
            failure_threshold     = 3
          }
        }
      }
    }
  }

  depends_on = [
    kubernetes_deployment.postgres,
    kubernetes_deployment.redis
  ]
}

resource "kubernetes_service" "workshop_api" {
  metadata {
    name      = "${var.app_name}-service"
    namespace = kubernetes_namespace.workshop.metadata[0].name
    labels = {
      app = var.app_name
    }
  }

  spec {
    type = "NodePort"

    port {
      port        = 80
      target_port = 3000
      protocol    = "TCP"
      name        = "http"
    }

    selector = {
      app = var.app_name
    }
  }
}

resource "kubernetes_horizontal_pod_autoscaler_v2" "workshop_api_hpa" {
  metadata {
    name      = "${var.app_name}-hpa"
    namespace = kubernetes_namespace.workshop.metadata[0].name
  }

  spec {
    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = kubernetes_deployment.workshop_api.metadata[0].name
    }

    min_replicas = 3
    max_replicas = 10

    metric {
      type = "Resource"
      resource {
        name = "cpu"
        target {
          type                = "Utilization"
          average_utilization = 70
        }
      }
    }

    metric {
      type = "Resource"
      resource {
        name = "memory"
        target {
          type                = "Utilization"
          average_utilization = 80
        }
      }
    }

    behavior {
      scale_down {
        stabilization_window_seconds = 300
        select_policy                = "Max"
        policy {
          type           = "Percent"
          value          = 50
          period_seconds = 60
        }
      }

      scale_up {
        stabilization_window_seconds = 0
        select_policy                = "Max"
        policy {
          type           = "Percent"
          value          = 100
          period_seconds = 30
        }
        policy {
          type           = "Pods"
          value          = 2
          period_seconds = 30
        }
      }
    }
  }
}
