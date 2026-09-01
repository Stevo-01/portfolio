terraform {
  backend "s3" {
    /*
      NOTE THE BUCKET NAME.

      This account also holds `portfolio-tfstate-047719653876` with a state file
      at exactly this key, belonging to a different live stack. Pointing at that
      bucket would load its state and the next apply could destroy its site.
      The bucket below is created by infra/bootstrap and is this project's alone.
    */
    bucket = "stephen-tfstate-047719653876"
    key    = "envs/prod/terraform.tfstate"
    region = "ap-southeast-1"

    encrypt = true

    # Native S3 locking, Terraform 1.10+. No DynamoDB table: the lock is an
    # object in the same bucket, which is one fewer resource and one fewer
    # bill line. Most tutorials still show a table; it is obsolete.
    use_lockfile = true
  }
}
