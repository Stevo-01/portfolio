terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
      # Callers must pass both providers explicitly. ACM for CloudFront only
      # exists in us-east-1, while the bucket lives elsewhere, so a module that
      # silently inherited one provider would create the certificate in the
      # wrong region and fail at attach time.
      configuration_aliases = [aws.us_east_1]
    }
  }
}
