output "site_url" { value = module.site.site_url }
output "bucket_name" { value = module.site.bucket_name }
output "distribution_id" { value = module.site.distribution_id }
output "distribution_domain_name" { value = module.site.distribution_domain_name }

output "deploy_role_arn" {
  description = "Set as AWS_DEPLOY_ROLE_ARN in the repository's Actions variables."
  value       = module.ci.deploy_role_arn
}

output "terraform_role_arn" {
  description = "Set as AWS_TERRAFORM_ROLE_ARN in the repository's Actions variables."
  value       = module.ci.terraform_role_arn
}
