resource "aws_cloudfront_response_headers_policy" "site" {
  name    = "${var.project}-${var.environment}-headers"
  comment = "Security headers for the static site"

  security_headers_config {
    strict_transport_security {
      # Two years, subdomains included. Preload is deliberately NOT set: getting
      # onto the preload list is easy and getting off it takes months, so it is
      # a commitment to make on purpose rather than by copying a snippet.
      access_control_max_age_sec = 63072000
      include_subdomains         = true
      preload                    = false
      override                   = true
    }

    content_type_options {
      override = true
    }

    frame_options {
      frame_option = "DENY"
      override     = true
    }

    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }

    content_security_policy {
      content_security_policy = local.content_security_policy
      override                = true
    }
  }

  custom_headers_config {
    items {
      header   = "permissions-policy"
      value    = "camera=(), microphone=(), geolocation=(), interest-cohort=()"
      override = true
    }
  }
}
