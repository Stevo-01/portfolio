terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Project     = var.project
      Environment = "prod"
      ManagedBy   = "terraform"
      Repo        = "${var.github_owner}/${var.github_repo}"
    }
  }
}

# CloudFront reads certificates only from us-east-1, and CloudFront metrics are
# published there too. Everything else lives in var.region.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = var.project
      Environment = "prod"
      ManagedBy   = "terraform"
      Repo        = "${var.github_owner}/${var.github_repo}"
    }
  }
}
