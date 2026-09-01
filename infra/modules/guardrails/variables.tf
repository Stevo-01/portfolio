variable "project" { type = string }

variable "monthly_budget_usd" {
  description = "Alert threshold. The stack should cost well under a dollar; five is the point at which something is wrong."
  type        = number
  default     = 5
}

variable "alert_emails" {
  description = "Budget alert subscribers. AWS emails a confirmation link on first apply and delivers nothing until it is clicked."
  type        = list(string)
  default     = []
}
