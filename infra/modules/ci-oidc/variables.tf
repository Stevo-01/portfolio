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

variable "subject_claims" {
  description = "Suffixes appended to repo:<owner>/<repo>: in the trust policy. Pin to a branch ref or a GitHub Environment. Never a bare wildcard."
  type        = list(string)
  default     = ["ref:refs/heads/main", "environment:prod"]

  validation {
    condition     = !contains(var.subject_claims, "*")
    error_message = "A bare \"*\" subject claim lets any workflow in the repository assume the role. Pin to a ref or an environment."
  }
}

variable "site_bucket_arn" { type = string }
variable "distribution_arn" { type = string }
