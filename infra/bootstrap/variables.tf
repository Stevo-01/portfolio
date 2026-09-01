variable "project" {
  description = "Name prefix for every resource. MUST NOT be \"portfolio\": that value belongs to a different live stack in this same account and would collide with its buckets and state key."
  type        = string

  validation {
    condition     = var.project != "portfolio"
    error_message = "project = \"portfolio\" collides with another live stack in account 047719653876. See infra/README.md."
  }
}

variable "region" {
  description = "Region for the state bucket."
  type        = string
  default     = "ap-southeast-1"
}

variable "github_owner" {
  type = string
}

variable "github_repo" {
  type = string
}
