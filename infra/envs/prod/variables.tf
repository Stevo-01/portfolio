variable "project" {
  description = "Resource name prefix. MUST NOT be \"portfolio\" -- see infra/README.md."
  type        = string

  validation {
    condition     = var.project != "portfolio"
    error_message = "project = \"portfolio\" collides with a different live stack in account 047719653876."
  }
}

variable "region" {
  type    = string
  default = "ap-southeast-1"
}

variable "domain_name" {
  description = "Registered apex. The hosted zone is read, never created."
  type        = string
}

variable "subdomain" {
  description = "Label in front of domain_name. A single label: the wildcard cert matches exactly one, so \"a.b\" would need its own certificate."
  type        = string

  validation {
    condition     = !strcontains(var.subdomain, ".")
    error_message = "subdomain must be a single label. *.domain matches one label only; a two-level name needs a new certificate, and ACM SANs are immutable."
  }
}

variable "price_class" {
  type    = string
  default = "PriceClass_100"
}

variable "github_owner" { type = string }
variable "github_repo" { type = string }
variable "github_owner_id" { type = string }
variable "github_repo_id" { type = string }

# site-deploy.yml's deploy job declares `environment: prod` and is the role's
# only entry point.
variable "deploy_subject_claims" {
  type    = list(string)
  default = ["environment:prod"]
}

# infra.yml enters the terraform role twice: plan on a push to main with no
# environment, and apply under `environment: infra-prod`. Both are needed, and
# `infra-prod` is deliberately not the same environment as the site deploy's.
variable "terraform_subject_claims" {
  type    = list(string)
  default = ["ref:refs/heads/main", "environment:infra-prod"]
}

variable "csp_script_hashes" {
  type    = list(string)
  default = []
}

variable "monthly_budget_usd" {
  type    = number
  default = 5
}

variable "alert_emails" {
  type    = list(string)
  default = []
}
