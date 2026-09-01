data "aws_caller_identity" "current" {}

locals {
  # The account id is read, never hardcoded, so this configuration is portable
  # to a fresh account without an edit.
  state_bucket = "${var.project}-tfstate-${data.aws_caller_identity.current.account_id}"
}

# --- Terraform state --------------------------------------------------------

resource "aws_s3_bucket" "state" {
  bucket = local.state_bucket

  # State is the one thing whose loss is unrecoverable. Deleting this bucket
  # should take a deliberate two-step.
  lifecycle {
    prevent_destroy = true
  }
}

# Separate resources, not nested blocks. Since AWS provider v4 the nested
# `versioning`/`server_side_encryption` blocks on aws_s3_bucket are ignored,
# and they fail silently: the bucket is created, the settings are not applied.
resource "aws_s3_bucket_versioning" "state" {
  bucket = aws_s3_bucket.state.id

  versioning_configuration {
    # Non-negotiable. Versioning is what makes a corrupted or truncated state
    # file recoverable, and it is also what native S3 locking relies on.
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "state" {
  bucket = aws_s3_bucket.state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "state" {
  bucket = aws_s3_bucket.state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "state" {
  bucket = aws_s3_bucket.state.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "state" {
  bucket = aws_s3_bucket.state.id

  # Versioning without expiry accumulates every state revision forever. Ninety
  # days is long enough to recover from a mistake anybody will notice.
  rule {
    id     = "expire-noncurrent"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 90
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }

  depends_on = [aws_s3_bucket_versioning.state]
}

# --- GitHub OIDC ------------------------------------------------------------

/*
  READ, NOT CREATED.

  An IAM OIDC provider is unique per account per URL, and
  token.actions.githubusercontent.com already exists in account 047719653876 --
  another project created it. Declaring `aws_iam_openid_connect_provider` here
  would fail with EntityAlreadyExists on the first apply, and importing it would
  hand this configuration the power to delete a provider another live stack
  depends on.

  A data source gives the ARN the roles need and no ability to change it.
*/
data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}
