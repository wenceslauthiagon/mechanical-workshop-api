/*
Optional OCI provisioning resources.
This file is conditioned on `var.provision_oci_cluster` (default: false).
It creates a basic VCN, Subnet, Internet Gateway and a simple OKE cluster + node pool.
Note: review and adjust shapes, image IDs, and networking to fit your tenancy and quotas.
*/

variable "oci_vcn_cidr" {
  description = "CIDR block for the VCN"
  type        = string
  default     = "10.0.0.0/16"
}

variable "oci_subnet_cidr" {
  description = "CIDR block for the subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "node_shape" {
  description = "Compute shape for worker nodes"
  type        = string
  default     = "VM.Standard.E3.Flex"
}

variable "node_count" {
  description = "Number of nodes in node pool"
  type        = number
  default     = 3
}

variable "node_image_id" {
  description = "OCI image OCID for worker nodes (provide for your region)"
  type        = string
  default     = ""
}

data "oci_identity_availability_domains" "ads" {
  compartment_id = var.oci_compartment_ocid
  count          = var.provision_oci_cluster ? 1 : 0
}

resource "oci_core_virtual_network" "vcn" {
  count         = var.provision_oci_cluster ? 1 : 0
  compartment_id = var.oci_compartment_ocid
  cidr_block     = var.oci_vcn_cidr
  display_name   = "${var.app_name}-vcn"
}

resource "oci_core_subnet" "subnet" {
  count          = var.provision_oci_cluster ? 1 : 0
  compartment_id = var.oci_compartment_ocid
  vcn_id         = oci_core_virtual_network.vcn[0].id
  cidr_block     = var.oci_subnet_cidr
  display_name   = "${var.app_name}-subnet"
  dns_label      = "${var.app_name}subnet"
}

resource "oci_core_internet_gateway" "igw" {
  count          = var.provision_oci_cluster ? 1 : 0
  compartment_id = var.oci_compartment_ocid
  vcn_id         = oci_core_virtual_network.vcn[0].id
  display_name   = "${var.app_name}-igw"
}

resource "oci_core_route_table" "rt" {
  count          = var.provision_oci_cluster ? 1 : 0
  compartment_id = var.oci_compartment_ocid
  vcn_id         = oci_core_virtual_network.vcn[0].id

  route_rules = [
    {
      destination = "0.0.0.0/0"
      network_entity_id = oci_core_internet_gateway.igw[0].id
    }
  ]
}

resource "oci_core_security_list" "sec_list" {
  count          = var.provision_oci_cluster ? 1 : 0
  compartment_id = var.oci_compartment_ocid
  vcn_id         = oci_core_virtual_network.vcn[0].id
  display_name   = "${var.app_name}-sec"

  ingress_security_rules = [
    {
      protocol = "6"
      tcp_options {
        max = 65535
        min = 1
      }
      source = "0.0.0.0/0"
    }
  ]

  egress_security_rules = [
    {
      protocol = "all"
      destination = "0.0.0.0/0"
    }
  ]
}

# Basic OKE cluster. This is intentionally minimal; review kube_version and node options.
resource "oci_containerengine_cluster" "oke" {
  count          = var.provision_oci_cluster ? 1 : 0
  compartment_id = var.oci_compartment_ocid
  name           = "${var.app_name}-oke"
  vcn_id         = oci_core_virtual_network.vcn[0].id
}

# Node pool for OKE
resource "oci_containerengine_node_pool" "nodepool" {
  count          = var.provision_oci_cluster ? 1 : 0
  compartment_id = var.oci_compartment_ocid
  cluster_id     = oci_containerengine_cluster.oke[0].id
  name           = "${var.app_name}-nodepool"

  node_config_details {
    placement_configs = [
      for ad in data.oci_identity_availability_domains.ads[0].availability_domains : {
        availability_domain = ad.name
        subnet_id            = oci_core_subnet.subnet[0].id
      }
    ]

    size  = var.node_count
    shape = var.node_shape
  }

  kubernetes_version = oci_containerengine_cluster.oke[0].kubernetes_version

  depends_on = [oci_containerengine_cluster.oke]
}

output "oke_cluster_id" {
  value = var.provision_oci_cluster ? oci_containerengine_cluster.oke[0].id : ""
}

output "oke_kubeconfig" {
  value = var.provision_oci_cluster ? oci_containerengine_cluster.oke[0].kube_config[0].value : ""
  description = "Base64 kubeconfig content (may require formatting)."
}
