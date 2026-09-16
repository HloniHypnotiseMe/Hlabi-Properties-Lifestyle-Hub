# Hlabi Properties Lifestyle Hub

A standalone digital ecosystem for **Hlabi Properties** — connecting homeowners, buyers, sellers, investors, property professionals, suppliers and aspiring estate agents in one property lifestyle hub.

> **Your property. Your plans. Your people. One hub.**

## Product boundary

This repository is **separate from C6GROUP**. C6 Group may provide technology, IP and orchestration behind the ecosystem, but this repository is the Hlabi Properties product codebase and brand surface.

## Core experiences

- Homeowners — Home Renewal Plan™, home audits, maintenance and supplier workflows
- Buyers — property discovery, buying guidance and transaction support
- Sellers — listing preparation, marketing and lead management
- Investors — opportunities, property intelligence and portfolio workflows
- Agents — AI Staff, CRM support, listing/content generation and reputation management
- Suppliers — verification, qualified leads, quotations and job workflows
- Academy — gamified training pathway for aspiring estate agents
- Franchise Accelerator — pathway for independent agents to operate Hlabi remote branches
- Partners — underwriter, payment and strategic ecosystem integrations

## Architecture direction

```text
apps/
  web/                 Public Hlabi website
  portal/              Authenticated Lifestyle Hub
modules/
  homeowners/
  buyers/
  sellers/
  investors/
  home-renewal/
  suppliers/
  agents/
  reputation/
  academy/
  franchise/
  partners/
backend/
integrations/
docs/
```

## Development principles

1. Hlabi-first customer experience.
2. Modular architecture so each ecosystem can evolve independently.
3. POPIA-conscious data handling, auditability and role-based access.
4. Insurance, franchise, property-practitioner and payment claims are implemented only after the relevant legal/compliance validation.
5. C6 intellectual property remains distinct from Hlabi brand assets and is integrated through explicit licensing where applicable.

## Initial delivery phases

1. Public website and ecosystem navigation
2. Homeowner onboarding and digital home audit
3. Home Renewal Plan workflow and supplier quote engine
4. Agent AI Staff and reputation management
5. Academy and Franchise Accelerator
6. Partner, underwriting and RemotePay integrations
7. Admin, analytics, security and operational hardening
