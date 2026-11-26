---
problem: bug-report/shipment-email-delayed
---

Report the 22-minute interval from enqueue to provider acceptance. The five-minute target covers precisely that interval, so it gives you a direct expected and actual comparison. It leaves open when the recipient actually received the message. Route the ticket to outbound notifications as the starting point and let the job history show where the delay accumulated.

Start with an email-enabled fixture order and mark it shipped. Capture when the job entered the queue and when the provider accepted that same message before calculating elapsed time. Include the shipment, queue, and provider identifiers. A redacted attempt history can distinguish a job sitting idle from a job making unsuccessful attempts. The report already tells you the number of test orders and the target.

The app still shows tracking, making S3 the fit. Repeated misses give it P1 under the stated policy. The decoy assigns the observed interval to the provider's delivery after acceptance, which the logs never timed.

See [ISTQB CTFL, defect management](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf). An interviewer wants the clock to start and stop at named events.
