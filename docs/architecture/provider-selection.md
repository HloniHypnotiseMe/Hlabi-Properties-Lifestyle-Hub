# Provider Selection Rules

1. Prefer open standards and HTTP/API boundaries over direct application coupling.
2. Keep provider credentials outside source control.
3. Use local inference where it is operationally appropriate and quality is sufficient.
4. Prefer self-hosted components for sensitive internal workloads when maintenance capacity exists.
5. Keep external communications and payment providers replaceable.
6. Use asynchronous workers for scraping, content generation, voice processing and long-running agent workflows.
7. Persist business events in the Hlabi database independently of provider state.
8. Record provider IDs for reconciliation, but do not make them primary business identifiers.
9. Add idempotency keys to payment and message operations before production use.
10. Add observability and dead-letter/retry handling to asynchronous integrations.
