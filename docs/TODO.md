# Hlabi Properties Lifestyle Hub — TODO Tracker

**Last updated:** 2026-09-18

This is the living execution tracker. `DONE` means the capability is represented in the repository; `NEXT` means the next implementation block; `HARDEN` means built but still requiring production validation, testing, assets or operational work.

## 1. Product foundation

- [x] `DONE` Public Lifestyle Hub / ecosystem navigation
- [x] `DONE` Homeowner portal and property ownership foundation
- [x] `DONE` Digital home audit
- [x] `DONE` Five-year Home Renewal workflow foundation
- [x] `DONE` Supplier quote/job/evidence foundation
- [x] `DONE` Reputation layer
- [x] `DONE` Buyer / seller / investor journey persistence foundation

## 2. Supplier ecosystem

- [x] `DONE` Supplier onboarding/readiness
- [x] `DONE` Eligibility and verification states
- [x] `DONE` Supplier opportunity feed
- [x] `DONE` Quote lifecycle foundation
- [x] `DONE` Job lifecycle foundation
- [x] `DONE` Completion evidence foundation
- [x] `DONE` Supplier reputation foundation
- [x] `DONE` End-to-end supplier/customer workflow tests — Pay → Complete → Review coverage added
- [ ] `HARDEN` Supplier verification operations/admin controls
- [x] `DONE` Quote selection → booking → payment/settlement server hardening
- [ ] `HARDEN` Provider-backed payment sandbox, webhook reconciliation and settlement retries

## 3. Home Passport

- [x] `DONE` Property lifecycle passport domain
- [x] `DONE` Memory + PostgreSQL persistence
- [x] `DONE` Owner-scoped API
- [x] `DONE` Lifestyle Hub dashboard/navigation
- [x] `DONE` Connect passport to audits, renewal plans, jobs, suppliers and quotes as live linked records
- [ ] `NEXT` Connect passport to reputation records; document/warranty records remain section data until a dedicated document store exists
- [ ] `HARDEN` Document/warranty storage and retrieval controls
- [ ] `HARDEN` POPIA retention, consent and deletion policy implementation

## 4. Academy

- [x] `DONE` Six-module Foundation curriculum
- [x] `DONE` Sequential lesson locking
- [x] `DONE` Required-content server gate
- [x] `DONE` Assessment engine
- [x] `DONE` Practical/simulation assessment + reviewer workflow
- [x] `DONE` Evidence package + readiness diagnostic
- [x] `DONE` Internal readiness examination architecture
- [x] `DONE` PostgreSQL persistence parity
- [x] `DONE` Academy gamification
- [x] `DONE` Academy AI Tutor boundary
- [ ] `HARDEN` Full automated Academy validation/build verification
- [ ] `HARDEN` Expand and validate production question bank against the current regulatory competency framework
- [ ] `NEXT` Real lesson video/audio assets
- [ ] `NEXT` Full readiness/evidence portfolio UX

## 5. Franchise Accelerator

- [x] `DONE` Academy → Agent → Office → Franchise state machine
- [x] `DONE` Readiness checklist
- [x] `DONE` PostgreSQL persistence
- [x] `DONE` Server-authoritative progression
- [x] `DONE` Lifestyle Hub dashboard
- [ ] `HARDEN` Office/territory commercial workflow
- [ ] `HARDEN` Legally reviewed franchise documentation and launch controls
- [ ] `NEXT` Academy → agent → office operational pipeline refinement

## 6. AI orchestration — CURRENT BUILD BLOCK

Existing AI foundations include a provider-neutral boundary, Ollama adapter, agent task orchestration, permission-based tools and approval-gated outputs.

- [x] `DONE` Trusted-advisor context assembler foundation — property, Home Passport, latest audit, eligible suppliers, quote requests and jobs
- [x] `DONE` Context-aware deterministic recommendation engine foundation
- [x] `DONE` Property-scoped advisor API with homeowner authorization
- [x] `DONE` Connect renewal plans into advisor context
- [x] `DONE` Surface unpaid booked jobs in advisor context
- [x] `DONE` Connect supplier reputation into advisor context
- [x] `DONE` Confirmation-gated supplier quote requests and service-job scheduling through the property advisor
- [x] `DONE` Connect authorised Academy/agent context into the property advisor
- [x] `DONE` Tool execution registry with explicit permissions
- [x] `DONE` Approval workflow for quote requests, messages and scheduling
- [x] `DONE` Idempotent AI task creation + action audit events
- [x] `DONE` Authorised AI task/result history endpoint
- [ ] `HARDEN` Provider health/failure/retry policy
- [ ] `HARDEN` Tenant/property data isolation tests

## 7. Buyer / seller / investor expansion

- [x] `DONE` Buyer discovery + affordability intake — live buyer journey capture
- [x] `DONE` Seller preparation → listing draft → confirmed publish workflow
- [x] `DONE` Seller lead → viewing → offer journey
- [x] `DONE` Investor opportunity intelligence screening foundation
- [x] `DONE` Investor portfolio/property intelligence workflow — watchlist and portfolio state foundation
- [x] `DONE` Investor portfolio intelligence — richer verified property data, diligence evidence and acquisition metrics
- [x] `DONE` Transaction support journey — accepted offer → agent → documents → transfer → completion
- [x] `DONE` Transaction participant authorization helper + regression coverage
- [x] `DONE` Transaction document storage provider boundary + real upload/download flow
- [x] `DONE` Full transaction API integration test suite (route-level in-memory integration coverage)

## 8. Media + experience

- [ ] `NEXT` Production Academy video assets
- [ ] `NEXT` Production Academy audio assets
- [x] `DONE` AI Tutor integrated directly into competency lessons
- [ ] `HARDEN` Mobile/responsive UX pass
- [ ] `HARDEN` Accessibility pass

## 9. Integrations / commercial infrastructure

- [ ] `NEXT` Payment/settlement sandbox for supplier jobs — provider/webhook hardening remains
- [ ] `NEXT` Messaging provider sandbox + delivery events
- [ ] `NEXT` Document storage provider boundary
- [ ] `NEXT` Scheduling provider boundary
- [ ] `NEXT` Notification preferences
- [ ] `HARDEN` Provider webhook verification, retries, monitoring and rollback

## 10. Production hardening

- [ ] `BLOCKER` Run API build + automated test suite in a working CI environment and resolve failures
- [ ] `BLOCKER` Verify web build
- [ ] `BLOCKER` Verify migrations against a clean PostgreSQL database
- [ ] `BLOCKER` Production authentication/identity provider
- [ ] `BLOCKER` Authorization/integration security review
- [ ] `HARDEN` Audit logging coverage
- [ ] `HARDEN` Rate limits / abuse controls
- [ ] `HARDEN` Error monitoring and alerting
- [ ] `HARDEN` Backup/restore and disaster recovery
- [ ] `HARDEN` POPIA data lifecycle controls

## 11. Operating model

- [ ] `NEXT` Supplier operations/admin console
- [ ] `NEXT` Academy reviewer operations console hardening
- [ ] `NEXT` Agent operating dashboard
- [ ] `NEXT` Franchise/office operations dashboard
- [ ] `NEXT` Customer support workflow
- [ ] `NEXT` Analytics: acquisition → trust → solve → retain → expand → refer

## Execution order

**Current:** transaction document storage/upload + API integration hardening.

**Then:** media/experience → commercial integrations → production hardening.

## Product test

Every new item must answer:

> **Does this materially improve the user's property/lifestyle journey?**

The target operating loop remains:

**Understand → Estimate → Compare → Choose → Book → Pay → Review → Repeat.**
