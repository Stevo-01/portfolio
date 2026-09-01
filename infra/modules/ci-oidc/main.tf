data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

/*
  ── THE TRUST POLICY IS THE WHOLE SECURITY BOUNDARY ───────────────────────

  These roles can be assumed by anyone who can make GitHub mint a token whose
  `sub` matches. Get the condition wrong and the blast radius is the role's
  entire permission set.

  Two conditions, both required:

    aud = sts.amazonaws.com    -- the token was minted for AWS, not for some
                                  other service that also trusts GitHub OIDC.
    sub = repo:owner/repo:...  -- and it came from THIS repository, on a
                                  specific ref or environment.

  A `sub` of `repo:Stevo-01/*` would let any repository in the account assume
  the role. A missing `sub` would let ANY GitHub repository on earth assume it.
  That is not a theoretical concern: the provider is public.

  `StringLike` rather than `StringEquals` because the ref and environment forms
  are passed as a list and may contain a wildcard within one repo's namespace
  (for example `repo:owner/repo:pull_request`). The repository prefix is always
  literal.
*/
data "aws_iam_policy_document" "trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [data.aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values = [
        for claim in var.subject_claims :
        "repo:${var.github_owner}/${var.github_repo}:${claim}"
      ]
    }
  }
}

# --- Deploy role ------------------------------------------------------------

/*
  Deliberately tiny. This role runs on every push to main, so it is the one an
  attacker reaches first if the repository is compromised. It can write objects
  into one bucket and invalidate one distribution. It cannot create, modify or
  delete a single piece of infrastructure -- not even the bucket it writes to.
*/
resource "aws_iam_role" "deploy" {
  name               = "${var.project}-${var.environment}-site-deploy"
  description        = "Publishes built site objects. No infrastructure permissions."
  assume_role_policy = data.aws_iam_policy_document.trust.json
}

data "aws_iam_policy_document" "deploy" {
  statement {
    sid    = "SyncObjects"
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:GetObject",
    ]
    resources = ["${var.site_bucket_arn}/*"]
  }

  statement {
    sid    = "ListForSync"
    effect = "Allow"
    # aws s3 sync needs ListBucket to work out what has changed; without it the
    # sync re-uploads everything on every deploy.
    actions   = ["s3:ListBucket"]
    resources = [var.site_bucket_arn]
  }

  statement {
    sid       = "InvalidateOneDistribution"
    effect    = "Allow"
    actions   = ["cloudfront:CreateInvalidation"]
    resources = [var.distribution_arn]
  }
}

resource "aws_iam_role_policy" "deploy" {
  name   = "${var.project}-${var.environment}-site-deploy"
  role   = aws_iam_role.deploy.id
  policy = data.aws_iam_policy_document.deploy.json
}

# --- Terraform role ---------------------------------------------------------

/*
  Broader by necessity: it manages the stack. Still scoped to the services this
  stack uses, so a compromise cannot reach into anything else in an account that
  hosts another project.
*/
resource "aws_iam_role" "terraform" {
  name               = "${var.project}-${var.environment}-terraform"
  description        = "Plans and applies this stack from CI."
  assume_role_policy = data.aws_iam_policy_document.trust.json
}

data "aws_iam_policy_document" "terraform" {
  statement {
    sid    = "ManageStack"
    effect = "Allow"
    actions = [
      "s3:*",
      "cloudfront:*",
      "acm:*",
      "route53:*",
      "iam:GetRole",
      "iam:PassRole",
      "iam:ListRolePolicies",
      "iam:GetRolePolicy",
      "iam:GetOpenIDConnectProvider",
      "cloudwatch:*",
      "budgets:*",
      "sns:*",
      "tag:GetResources",
    ]
    resources = ["*"]
  }

  /*
    Explicit deny on deleting the other project's live resources.

    Terraform should never target them -- different state, different names --
    but this account hosts a live site that is not managed from this repository,
    and an explicit deny cannot be overridden by any Allow. It costs nothing and
    removes the worst-case outcome of a mistyped `-target` or an imported
    resource.
  */
  statement {
    sid    = "ProtectOtherProject"
    effect = "Deny"
    actions = [
      "s3:DeleteBucket",
      "s3:DeleteObject",
      "cloudfront:DeleteDistribution",
    ]
    resources = [
      "arn:aws:s3:::portfolio-*",
      "arn:aws:s3:::portfolio-*/*",
    ]
  }
}

resource "aws_iam_role_policy" "terraform" {
  name   = "${var.project}-${var.environment}-terraform"
  role   = aws_iam_role.terraform.id
  policy = data.aws_iam_policy_document.terraform.json
}
