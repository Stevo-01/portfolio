/*
  A budget alert, scoped to this project's tags.

  Budget NAMES are unique per account, and this account already holds one called
  "portfolio-monthly-cost" belonging to a different stack. Hence the project
  prefix: an unprefixed name would collide on apply.

  Cost filters restrict it to resources tagged with this project, so the alert
  reflects this stack rather than the whole account.
*/
resource "aws_budgets_budget" "monthly" {
  name         = "${var.project}-monthly-cost"
  budget_type  = "COST"
  limit_amount = tostring(var.monthly_budget_usd)
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  cost_filter {
    name   = "TagKeyValue"
    values = ["user:Project$${var.project}"]
  }

  # Actual spend crossing 80%: something has already changed.
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = var.alert_emails
  }

  # Forecast crossing 100%: the month is trending over before it happens.
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = var.alert_emails
  }
}
