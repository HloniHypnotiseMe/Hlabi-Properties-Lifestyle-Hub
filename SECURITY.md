# Security Policy

## Reporting a vulnerability

Please do not publish security vulnerabilities, credentials, personal information or exploit details in a public issue.

For the production platform, security reports should be routed through the designated private reporting channel maintained by the repository owner. Until that channel is configured, use a private GitHub security report where available rather than a public issue.

## Scope

This repository will eventually support property, homeowner, supplier, agent, document, payment and communication workflows. Security issues involving authentication, authorization, data exposure, secret leakage, dependency vulnerabilities or payment integrations should be treated as high priority.

## Secrets

Never commit API keys, passwords, private keys, payment credentials, access tokens or production customer data. Use environment variables or an approved secret-management system.

## Production readiness

The demo homeowner adapter is not a production authentication or data-storage mechanism. Production launch requires security review, authenticated API access, role-based authorization, logging, dependency monitoring and appropriate POPIA/privacy controls.
