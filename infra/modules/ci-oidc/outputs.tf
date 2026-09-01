output "deploy_role_arn" {
  description = "Assumed by site-deploy.yml."
  value       = aws_iam_role.deploy.arn
}

output "terraform_role_arn" {
  description = "Assumed by infra.yml."
  value       = aws_iam_role.terraform.arn
}
