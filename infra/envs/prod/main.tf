locals {
  site_host = "${var.subdomain}.${var.domain_name}"
}

/*
  ── EVERYTHING SHARED IS READ, NOT CREATED ────────────────────────────────

  This account hosts another live site. Three resources below already exist and
  belong to it or to the account as a whole, so they are consumed through data
  sources. Declaring any of them as a resource would either fail on apply or,
  worse, put them under this configuration's control and inside the blast radius
  of a `terraform destroy`.
*/

# The zone also carries MX and TXT records for the apex. Read only.
data "aws_route53_zone" "root" {
  name         = "${var.domain_name}."
  private_zone = false
}

/*
  The wildcard certificate is already ISSUED in us-east-1 and covers
  *.naijora.com plus the apex, which includes this host. It is currently
  attached to nothing.

  Requesting a second certificate for the same name would work, but it would
  write validation CNAMEs into a shared zone and leave two certificates to
  renew for one site. Reusing the issued one is free and has no downside: ACM
  renewal is automatic and independent of who consumes the cert.
*/
data "aws_acm_certificate" "wildcard" {
  provider    = aws.us_east_1
  domain      = "*.${var.domain_name}"
  statuses    = ["ISSUED"]
  most_recent = true
}

module "site" {
  source = "../../modules/static-site"

  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }

  project     = var.project
  environment = "prod"

  site_host       = local.site_host
  hosted_zone_id  = data.aws_route53_zone.root.zone_id
  certificate_arn = data.aws_acm_certificate.wildcard.arn

  price_class       = var.price_class
  csp_script_hashes = var.csp_script_hashes
}

module "ci" {
  source = "../../modules/ci-oidc"

  project     = var.project
  environment = "prod"

  github_owner    = var.github_owner
  github_repo     = var.github_repo
  github_owner_id = var.github_owner_id
  github_repo_id  = var.github_repo_id
  subject_claims  = var.deploy_subject_claims

  site_bucket_arn  = module.site.bucket_arn
  distribution_arn = module.site.distribution_arn
}

module "guardrails" {
  source = "../../modules/guardrails"

  project            = var.project
  monthly_budget_usd = var.monthly_budget_usd
  alert_emails       = var.alert_emails
}
