/*
  One alarm. CloudFront 5xx rate above 1% sustained over ten minutes means the
  origin or the distribution is broken, which for a static site is the only
  failure worth waking up for.

  The metric lives in us-east-1 regardless of where anything else is, because
  CloudFront is a global service and publishes there.
*/
resource "aws_cloudwatch_metric_alarm" "cloudfront_5xx" {
  provider = aws.us_east_1

  alarm_name          = "${var.project}-${var.environment}-cloudfront-5xx"
  alarm_description   = "CloudFront 5xx error rate above 1% for 10 minutes"
  namespace           = "AWS/CloudFront"
  metric_name         = "5xxErrorRate"
  statistic           = "Average"
  period              = 300
  evaluation_periods  = 2
  threshold           = 1
  comparison_operator = "GreaterThanThreshold"

  # A distribution with no traffic emits no datapoints. Treating missing data as
  # breaching would page on every quiet night.
  treat_missing_data = "notBreaching"

  dimensions = {
    DistributionId = aws_cloudfront_distribution.site.id
    Region         = "Global"
  }

  # The alarm exists either way so the metric is graphed; it just has nowhere to
  # publish until a topic is supplied.
  alarm_actions = var.alarm_sns_topic_arn == "" ? [] : [var.alarm_sns_topic_arn]
  ok_actions    = var.alarm_sns_topic_arn == "" ? [] : [var.alarm_sns_topic_arn]
}
