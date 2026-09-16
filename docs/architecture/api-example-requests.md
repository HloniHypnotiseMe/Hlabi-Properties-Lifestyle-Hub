# Homeowner audit API examples

## Submit audit

`POST /api/v1/homeowner/audits`

```json
{
  "propertyId": "demo-property-1",
  "findings": [
    {
      "area": "roof",
      "grade": "AMBER",
      "description": "Minor wear or age-related issue.",
      "priority": "MEDIUM",
      "recommendedAction": "Arrange a verified supplier inspection.",
      "verified": false
    }
  ]
}
```

The production request must contain all nine audit areas. The server validates the schema and confirms that the property belongs to the authenticated homeowner before accepting the audit.

## Identity

The current development adapter uses `x-hlabi-user-id`. It is deliberately temporary and must be replaced by verified authentication before any production deployment.
