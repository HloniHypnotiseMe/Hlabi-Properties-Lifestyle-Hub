# Buyer, Seller & Investor Journeys

The Lifestyle Hub now has a provider-neutral profile foundation for three core property journeys.

## Buyer
Captures location, property-type, budget, bedroom and financing preferences. This is a preference profile, not a mortgage approval or property recommendation engine.

## Seller
Captures a property-specific sale intent, target date, reason and readiness. Seller access is tied to an authenticated user's ownership of the property.

## Investor
Captures target area, strategy, budget, target yield and risk profile. Investment fields describe user preferences and do not constitute financial advice, a valuation or a guaranteed return.

## API
- `POST/GET /api/v1/buyer/journey`
- `POST/GET /api/v1/seller/journey/:propertyId`
- `POST/GET /api/v1/investor/journey`

All endpoints require authenticated role-specific principals. Seller writes verify property ownership before persistence.

## Next layer
These profiles can feed future property discovery, valuation/listing preparation, lead routing and investor analytics. Any matching or recommendation engine should remain explainable and auditable, and consequential actions should continue through the existing approval and authorization controls.

Production requirements include real identity, consent/POPIA controls, validation of financial fields, audit logging and rate limiting.
