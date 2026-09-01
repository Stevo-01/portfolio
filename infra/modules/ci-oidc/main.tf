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
    sub = repo:owner@id/repo@id:...
                               -- and it came from THIS repository, on a
                                  specific ref or environment.

  A `sub` of `repo:Stevo-01/*` would let any repository in the account assume
  the role. A missing `sub` would let ANY GitHub repository on earth assume it.
  That is not a theoretical concern: the provider is public.

  ── WHY THE NUMERIC IDS ARE IN THE PREFIX ─────────────────────────────────

  GitHub now mints the subject with the owner and repository database ids
  embedded, and it does so whether or not `use_immutable_subject` is set:

    repo:Stevo-01@65500009/portfolio@1353605628:ref:refs/heads/main

  not the name-only form this policy used to expect. A trust policy written
  against `repo:Stevo-01/portfolio:` matches nothing, and every job that needs
  AWS dies at "Not authorized to perform sts:AssumeRoleWithWebIdentity" while
  jobs needing no credentials pass, which reads like a permissions bug rather
  than a claim-format one. Confirm the live format from CloudTrail
  (`userIdentity.principalId`) rather than from docs; it is authoritative.

  This is tighter than the name form, not merely different, and the reason is
  this repository's own history: it was deleted and recreated during the
  build. Names are reusable, so a policy trusting `Stevo-01/portfolio` also
  trusts whoever holds that name next. Ids are never reissued. Pinning them is
  what makes a deleted-and-recreated repository fail closed.

  Only the id form is trusted. Carrying the legacy name form alongside it as a
  fallback would reintroduce exactly the name-reuse hole the ids close, and
  this AWS account also hosts an unrelated live site.

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
        "repo:${var.github_owner}@${var.github_owner_id}/${var.github_repo}@${var.github_repo_id}:${claim}"
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
  /*
    S3 is enumerated rather than wildcarded.

    `s3:*` was the first version and trivy was right to flag it (AWS-0345): on
    "*" resources it grants this role read and delete over every bucket in an
    account that also holds an unrelated live site. The explicit Deny below
    limits the damage, but a Deny is a backstop, not a design.

    These are the verbs Terraform actually uses to manage a bucket, its policy
    and its configuration sub-resources. If an apply ever fails with
    AccessDenied on an s3 action, add that verb here rather than restoring the
    wildcard.
  */
  statement {
    sid    = "ManageBuckets"
    effect = "Allow"
    actions = [
      "s3:CreateBucket",
      "s3:DeleteBucket",
      "s3:ListBucket",
      "s3:ListAllMyBuckets",
      "s3:GetBucketLocation",
      "s3:GetBucketVersioning",
      "s3:PutBucketVersioning",
      "s3:GetBucketPolicy",
      "s3:PutBucketPolicy",
      "s3:DeleteBucketPolicy",
      "s3:GetBucketPublicAccessBlock",
      "s3:PutBucketPublicAccessBlock",
      "s3:GetBucketOwnershipControls",
      "s3:PutBucketOwnershipControls",
      "s3:GetEncryptionConfiguration",
      "s3:PutEncryptionConfiguration",
      "s3:GetLifecycleConfiguration",
      "s3:PutLifecycleConfiguration",
      "s3:GetBucketTagging",
      "s3:PutBucketTagging",
      "s3:GetBucketAcl",
      "s3:GetBucketCORS",
      "s3:GetBucketLogging",
      "s3:GetBucketWebsite",
      "s3:GetAccelerateConfiguration",
      "s3:GetBucketRequestPayment",
      "s3:GetBucketObjectLockConfiguration",
      "s3:GetBucketNotification",
      "s3:GetReplicationConfiguration",
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:GetObjectVersion",
      "s3:DeleteObjectVersion",
    ]
    # Scoped to this project's buckets and its state bucket. Terraform has no
    # reason to touch any other bucket in the account.
    resources = [
      "arn:aws:s3:::${var.project}-*",
      "arn:aws:s3:::${var.project}-*/*",
    ]
  }

  statement {
    sid    = "ManageStack"
    effect = "Allow"
    actions = [
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
