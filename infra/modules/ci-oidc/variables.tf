variable "project" { type = string }
variable "environment" { type = string }
variable "github_owner" { type = string }
variable "github_repo" { type = string }

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
