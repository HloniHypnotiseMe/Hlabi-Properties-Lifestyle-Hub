# Integration Contract Summary

The API exposes capability interfaces rather than provider-specific SDKs.

- Communications: email, WhatsApp, SMS
- Commerce: payment initiation and reconciliation
- Intelligence: agent workflow execution, memory write/search
- Media: STT/TTS and content generation
- Discovery: scraping and business discovery workers
- Infrastructure: health, metrics and deployment boundaries

This separation lets the product use the supplied open-source stack while retaining the ability to replace individual components without rewriting the customer-facing application.