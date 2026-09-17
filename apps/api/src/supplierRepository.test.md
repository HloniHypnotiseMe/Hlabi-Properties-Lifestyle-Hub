Test scenarios for the supplier quote repository:

- eligible supplier discovery returns only active, verified suppliers matching the requested category
- quote requests are persisted with property and homeowner ownership
- quote responses are visible only through an owner-scoped request
- supplier quote submission copies property/owner/audit context from the quote request
- PostgreSQL and memory adapters expose the same repository contract

Automated test runner integration will be added with the wider API test harness rather than introducing a one-off test dependency here.
