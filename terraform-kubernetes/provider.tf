terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "mechanical-workshop-tfstate"
    storage_account_name = "workshoptfstate"
    container_name       = "tfstate"
    key                  = "kubernetes.terraform.tfstate"
  }
}

provider "azurerm" {
  features {}
}
