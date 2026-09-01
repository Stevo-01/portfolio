locals {
  bucket_name = "${var.project}-${var.environment}-site-${data.aws_caller_identity.current.account_id}"

  # Only emitted when hashes exist. A script-src directive with no hashes blocks
  # the inline theme-init script, which makes every page flash the wrong theme
  # before paint -- and nothing fails server-side to tell you.
  script_src = length(var.csp_script_hashes) > 0 ? format(
    "script-src 'self' %s; ",
    join(" ", formatlist("'%s'", var.csp_script_hashes))
  ) : ""

  content_security_policy = join("", [
    "default-src 'self'; ",
    local.script_src,
    # Astro emits scoped styles inline, so 'unsafe-inline' for style-src is
    # unavoidable without hashing every style block on every build.
    "style-src 'self' 'unsafe-inline'; ",
    "img-src 'self' data:; ",
    # Self-hosted fonts only. No Google Fonts origin, which is half the reason
    # the site self-hosts Geist.
    "font-src 'self'; ",
    "connect-src 'self'; ",
    "frame-ancestors 'none'; ",
    "base-uri 'self'; ",
    "form-action 'self'; ",
    "object-src 'none'; ",
    "upgrade-insecure-requests",
  ])
}

data "aws_caller_identity" "current" {}
