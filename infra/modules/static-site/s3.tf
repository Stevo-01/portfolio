resource "aws_s3_bucket" "site" {
  bucket = local.bucket_name
}

/*
  Note what is NOT here: aws_s3_bucket_website_configuration.

  Enabling the website endpoint would give directory-index resolution for free,
  but the website endpoint cannot be private -- it has no support for Origin
  Access Control, so the bucket would have to be world-readable and CloudFront
  would become optional rather than the only way in.

  Using the REST endpoint keeps the bucket private and is what forces the
  CloudFront Function in cloudfront.tf. That trade is deliberate.
*/

resource "aws_s3_bucket_versioning" "site" {
  bucket = aws_s3_bucket.site.id

  versioning_configuration {
    # A bad deploy is recoverable by rolling the objects back rather than
    # rebuilding and re-uploading.
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket = aws_s3_bucket.site.id

  # All four, always. The bucket is reachable only through CloudFront.
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "site" {
  bucket = aws_s3_bucket.site.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  # Every deploy replaces hashed assets, so old versions pile up quickly. Thirty
  # days is well past the point anyone would roll back.
  rule {
    id     = "expire-noncurrent"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 30
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }

  depends_on = [aws_s3_bucket_versioning.site]
}

# --- Bucket policy ----------------------------------------------------------

data "aws_iam_policy_document" "site" {
  statement {
    sid    = "AllowCloudFrontRead"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.site.arn}/*"]

    /*
      The condition is the whole security boundary.

      Without it, the policy reads "any CloudFront distribution may read this
      bucket" -- including a distribution in a stranger's account, who could
      then serve this bucket's contents from their own domain. Pinning
      AWS:SourceArn to this one distribution is what makes OAC actually private.
    */
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.site.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  policy = data.aws_iam_policy_document.site.json

  # The policy references the distribution ARN and the distribution references
  # the bucket, so this must land after the block or the first apply races.
  depends_on = [aws_s3_bucket_public_access_block.site]
}
