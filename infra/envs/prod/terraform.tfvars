# ⚠️ project MUST NOT be "portfolio".
#
# Account 047719653876 hosts a different, live site whose resources are all
# named portfolio-*, including a state bucket with the same key this
# environment uses. Reusing the prefix would collide with its buckets and could
# destroy its distribution. A variable validation rejects the value; this note
# explains why it exists.
project = "stephen"

region = "ap-southeast-1"

# The hosted zone for this apex already exists and is shared with the other
# site. It is read, never managed, so a destroy here cannot remove the domain's
# MX and TXT records.
domain_name = "naijora.com"

# Covered by the already-issued *.naijora.com wildcard, so this needs no ACM
# request and no new validation records.
subdomain = "stephen"

github_owner = "Stevo-01"
github_repo  = "portfolio"

price_class = "PriceClass_100"

# TODO(owner): confirm before the first apply. AWS emails a confirmation link
# and delivers nothing until it is clicked.
alert_emails       = ["olamsteph@gmail.com"]
monthly_budget_usd = 5

# Filled by `node scripts/csp-hashes.mjs --write` once slice 4.3 lands. Empty
# means script-src is omitted rather than shipping a policy that blocks the
# inline theme-init script.
csp_script_hashes = [
  "sha256-/P0xZ85yoOSInNohV021oUeylP6q798IFd+kUux47Hc=",
  "sha256-EiP6ZPePwlhDupwcdeYQxWIZCPZYuTfMQwiHgHj5G/Y=",
  "sha256-FtTTY6wjbRschQ150xpXECL8Ibn5XLcargrzY8W5P/E=",
  "sha256-IELQHNv9npODnM2yHfY9EqGtFRXE//knx2fZeeIdxzE=",
  "sha256-PACpHTmhqfU8cJOcpUEe3BA9RywRAvHnZ+YcVE/ZBHk=",
  "sha256-qWM4ddSu36P/nFFZvzoVtmoKIjBND3mpIdcoZIuTaHA=",
]
