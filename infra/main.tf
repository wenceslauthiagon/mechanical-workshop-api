terraform {
  required_version = ">= 1.0"
}

provider "local" {}

resource "null_resource" "note" {
  provisioner "local-exec" {
    command = "echo 'Terraform scaffold - replace with cloud provider resources'"
  }
}
