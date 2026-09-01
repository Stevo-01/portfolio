# MUST NOT be "portfolio". That prefix belongs to a different live stack in this
# same AWS account; reusing it collides with its buckets and its state key.
# A variable validation rejects it, but the reason belongs here too.
project = "stephen"

region = "ap-southeast-1"

github_owner = "Stevo-01"
github_repo  = "portfolio"
