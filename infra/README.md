# infra

Terraform for the static site: S3 behind CloudFront, TLS from ACM, DNS in
Route 53, deployed by GitHub Actions over OIDC with no long-lived keys.

Steady-state cost is a rounding error, on the order of $0.50 a month, because
there is no VPC, no NAT Gateway, no load balancer, and no always-on compute.
If a plan ever proposes one of those, something has gone wrong.

---

## ⚠️ This account is shared. Read this before running anything.

AWS account `047719653876` already hosts a **different, live** portfolio at
`joshua.naijora.com`. That stack is not managed from this repository:

| Resource | Belongs to |
|---|---|
| CloudFront `E2Z47V3NHAAM77` (`joshua.naijora.com`) | the other project |
| S3 `portfolio-prod-site-047719653876` | the other project |
| S3 `portfolio-tfstate-047719653876` | the other project |
| IAM `portfolio-prod-site-deploy`, `portfolio-terraform` | the other project |
| Budget `portfolio-monthly-cost` | the other project |

Everything here is namespaced `stephen-*` so nothing can collide. That naming
is a safety boundary, not a style choice:

> The reference implementation this was modelled on uses `project = "portfolio"`.
> Copying that value would generate byte-identical bucket names **and an
> identical state key** — `envs/prod/terraform.tfstate` in
> `portfolio-tfstate-047719653876`. A `terraform init` would silently adopt the
> other project's live state, and the next apply or destroy would take its site
> down. Do not change `project` to `portfolio`.

Three things are account-wide singletons and are therefore **reused, never
created** by this configuration:

- The GitHub OIDC provider (`token.actions.githubusercontent.com`) already
  exists. `bootstrap/` reads it with a data source.
- The wildcard certificate `*.naijora.com` (+ apex SAN) is already ISSUED in
  `us-east-1` and currently used by nothing. This stack consumes it by ARN and
  requests no certificate of its own.
- The `naijora.com` hosted zone already exists. This stack reads it and adds
  two records. It must never manage or destroy the zone, which also carries MX
  and TXT records for the domain.

## Layout

```
bootstrap/          state bucket + a place to bootstrap from. Run once.
envs/prod/          the only environment. Provider config, backend, module calls.
modules/
  static-site/      S3 + OAC + CloudFront + headers + alias records + alarm
  ci-oidc/          the two deploy roles and their trust policies
  guardrails/       budget alert
```

There is deliberately **one** environment. A staging CloudFront distribution
for a personal site is cost with no reader.

## Running it

```bash
export AWS_PROFILE=josh

# once, to create the state bucket
cd infra/bootstrap
terraform init && terraform apply
terraform init -migrate-state       # move bootstrap's own state into the bucket

# thereafter
cd ../envs/prod
terraform init
terraform plan                       # read this properly before applying
terraform apply
```

`plan` is safe and creates nothing. `apply` creates a CloudFront distribution,
which takes five to fifteen minutes, and a distribution must be disabled before
it can be destroyed.

## State locking

Native S3 locking via `use_lockfile = true`, available since Terraform 1.10.
**There is no DynamoDB table and there should not be one.** Most tutorials still
show one; it is obsolete and an extra bill line.

## The CSP script hash

`csp_script_hashes` starts empty. The theme-init script is inline in every
page's `<head>`, so its SHA-256 has to be pinned or the CSP blocks it. The hash
is generated from the built output:

```bash
cd site && npm run build && cd .. && node scripts/csp-hashes.mjs --write
```

That script is slice 4.3's. Until it exists, the CSP omits `script-src`
restrictions rather than shipping a policy that blocks the theme script and
flashes the wrong theme on every page load.
