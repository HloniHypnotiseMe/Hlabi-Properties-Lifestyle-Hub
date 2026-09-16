# Hlabi Properties Lifestyle Hub — Application Architecture

## Product principle
The public Hlabi website is the front door. The authenticated Lifestyle Hub is the operating layer behind it.

## Primary user journeys

### Homeowner
- Create account
- Add property
- Complete digital home audit
- View property condition and renewal priorities
- Request quotes
- Review supplier options
- Track work
- Maintain a five-year renewal timeline

### Buyer
- Create buyer profile
- Capture requirements and affordability information
- Browse or receive property opportunities
- Save properties
- Request viewing/contact
- Move into transaction support

### Seller
- Create property profile
- Seller onboarding
- Property preparation checklist
- Listing information
- Lead and viewing management
- Sale journey tracking

### Investor
- Portfolio dashboard
- Property opportunities
- Maintenance/renewal tracking
- Supplier workflows
- Performance and document centre

### Agent
- Agent dashboard
- Listings
- Leads
- Follow-ups
- AI staff
- Marketing/content workspace
- Reputation management
- Client communications
- Performance dashboard

### Supplier
- Supplier profile and verification
- Service categories and operating areas
- Quote requests
- Job pipeline
- Work completion evidence
- Customer feedback
- Payment/job status

### Academy
- Learner profile
- Course modules
- Simulations and assessments
- Progress tracking
- Completion records
- Internship/placement pathway

### Franchise Accelerator
- Applicant onboarding
- Readiness checklist
- Branch profile
- Territory information
- Training and support
- Compliance/document centre

## Core domain objects

`User` · `Role` · `Property` · `PropertyAudit` · `RenewalPlan` · `RenewalTask` · `Supplier` · `QuoteRequest` · `Quote` · `Job` · `Lead` · `Listing` · `Viewing` · `Conversation` · `ReputationProfile` · `Course` · `Lesson` · `Assessment` · `AcademyProgress` · `Branch` · `Partner` · `Document` · `Payment`

## Role-based access

Use least-privilege access. A user may hold multiple roles, but access to properties, customer records, financial information and operational workflows must be scoped to the user's role and organisation/branch.

## Product boundaries

- The Home Renewal Plan is a proposed property-maintenance/service product. Any insurance, underwriting, claims or regulated financial functionality must be implemented only after the applicable structure and approvals are confirmed.
- Academy completion must not be described as professional accreditation unless the relevant accreditation exists.
- Franchise functionality must use legally reviewed franchise documentation and applicable South African requirements before commercial launch.
- Property-value outcomes should be described as objectives or potential benefits, not guarantees.
- POPIA, security, consent, audit logging and data-retention requirements are first-class platform concerns.

## Delivery sequence

1. Authentication and role model
2. Property profile and home audit
3. Home Renewal workflow
4. Supplier/quote workflow
5. Agent workspace and reputation layer
6. Buyer/seller/investor journeys
7. Academy
8. Franchise Accelerator
9. Partner/underwriter portal
10. RemotePay and external integrations
11. Administration, analytics and audit controls
