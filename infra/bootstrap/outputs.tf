output "state_bucket" {
  description = "Backend bucket. Paste into each environment's backend.tf."
  value       = aws_s3_bucket.state.id
}

output "github_oidc_provider_arn" {
  description = "Pre-existing account-wide provider, read not created."
  value       = data.aws_iam_openid_connect_provider.github.arn
}

output "account_id" {
  value = data.aws_caller_identity.current.account_id
}
