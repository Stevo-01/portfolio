resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "${var.project}-${var.environment}-oac"
  description                       = "Signs CloudFront's requests to the private S3 origin"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_function" "directory_index" {
  name    = "${var.project}-${var.environment}-directory-index"
  runtime = "cloudfront-js-2.0"
  comment = "Rewrites directory URIs to index.html. Mandatory with OAC; see the function source."
  publish = true
  code    = file("${path.module}/functions/directory-index.js")
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.project} ${var.environment}"
  default_root_object = "index.html"
  price_class         = var.price_class
  aliases             = [var.site_host]

  # Logging deliberately off. It writes to another bucket, which is another
  # bill line and another lifecycle rule, for traffic this site does not have.
  # If it is ever turned on, add a 7-day expiry with it.

  origin {
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                = "s3-${aws_s3_bucket.site.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  default_cache_behavior {
    target_origin_id       = "s3-${aws_s3_bucket.site.id}"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    # AWS managed policies rather than hand-rolled ones: CachingOptimized is
    # the standard static-asset policy and needs no maintenance.
    cache_policy_id            = data.aws_cloudfront_cache_policy.optimized.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.site.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.directory_index.arn
    }
  }

  /*
    BOTH 403 and 404 map to the 404 page, and the 403 mapping is the one that
    actually matters.

    The bucket is private, so S3 answers a request for a key that does not exist
    with AccessDenied, not NoSuchKey -- it will not confirm absence to an
    unauthorised caller. CloudFront surfaces that as 403. Mapping only 404 would
    mean the custom 404 page never appears for a genuine typo, which is the only
    case it exists for.

    error_caching_min_ttl is short so a page that starts existing stops 404ing
    quickly.
  */
  custom_error_response {
    error_code            = 403
    response_code         = 404
    response_page_path    = "/404.html"
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code            = 404
    response_code         = 404
    response_page_path    = "/404.html"
    error_caching_min_ttl = 10
  }

  viewer_certificate {
    acm_certificate_arn = var.certificate_arn
    ssl_support_method  = "sni-only"
    # TLS 1.2 is the floor. 1.0 and 1.1 are deprecated and only reachable by
    # browsers that cannot render this site anyway.
    minimum_protocol_version = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}

data "aws_cloudfront_cache_policy" "optimized" {
  name = "Managed-CachingOptimized"
}
