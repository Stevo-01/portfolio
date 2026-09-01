variable "project" { type = string }
variable "environment" { type = string }
variable "github_owner" { type = string }
variable "github_repo" { type = string }

# The numeric ids GitHub embeds in the OIDC subject. Names are reusable and
# these are not, which is the entire point of pinning them. See the trust
# policy comment in main.tf.
#
#   gh api repos/<owner>/<repo> --jq '"\(.owner.id) \(.id)"'
#
# Digits only: a name here would silently produce a subject that matches
# nothing, and the failure surfaces as an unrelated-looking AWS permissions
# error inside CI rather than as a Terraform error here.
variable "github_owner_id" {
  type = string
  validation {
    condition     = can(regex("^[0-9]+$", var.github_owner_id))
    error_message = "github_owner_id must be the numeric account id, not the login."
  }
}

variable "github_repo_id" {
  type = string
  validation {
    condition     = can(regex("^[0-9]+$", var.github_repo_id))
    error_message = "github_repo_id must be the numeric repository id, not the name."
  }
}

# Claims are per role, not shared. See the role_claims comment in main.tf for
# why `prod` and `infra-prod` must stay distinct.
variable "deploy_subject_claims" {
  description = "Subject suffixes trusted by the site-deploy role. Its only entry point is site-deploy.yml's deploy job, which declares environment: prod."
  type        = list(string)
  default     = ["environment:prod"]

  validation {
    condition     = !contains(var.deploy_subject_claims, "*")
    error_message = "A bare \"*\" subject claim lets any workflow in the repository assume the role. Pin to a ref or an environment."
  }
}

variable "terraform_subject_claims" {
  description = "Subject suffixes trusted by the terraform role. infra.yml enters it twice: plan on a push to main (no environment), and apply under environment: infra-prod."
  type        = list(string)
  default     = ["ref:refs/heads/main", "environment:infra-prod"]

  validation {
    condition     = !contains(var.terraform_subject_claims, "*")
    error_message = "A bare \"*\" subject claim lets any workflow in the repository assume the role. Pin to a ref or an environment."
  }
}

variable "site_bucket_arn" { type = string }
variable "distribution_arn" { type = string }
