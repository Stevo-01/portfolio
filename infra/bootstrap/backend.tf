# Deliberately empty on the first run: this configuration creates the bucket it
# will later live in, so it starts with local state.
#
# After the first apply, uncomment and run `terraform init -migrate-state`.
#
# terraform {
#   backend "s3" {
#     bucket       = "stephen-tfstate-047719653876"
#     key          = "bootstrap/terraform.tfstate"
#     region       = "ap-southeast-1"
#     encrypt      = true
#     use_lockfile = true
#   }
# }
