/*
  Alias records only. The hosted zone itself is read by the caller and passed in
  as an id, never managed here.

  That separation is deliberate: the zone carries MX and TXT records for the
  whole domain, and a `terraform destroy` of this site must not be able to take
  the domain's email with it.

  A and AAAA rather than CNAME, because a CNAME cannot point at CloudFront from
  an apex and alias queries are free where CNAME lookups are billed.
*/

resource "aws_route53_record" "ipv4" {
  zone_id = var.hosted_zone_id
  name    = var.site_host
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "ipv6" {
  zone_id = var.hosted_zone_id
  name    = var.site_host
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}
