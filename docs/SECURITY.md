# Furukawa Archive OS Security Policy

## Core Principles
- **Minimal Surface Area**: Microservices are containerized and only the Edge Gateway is exposed to the public.
- **Data Integrity**: All database interactions use parameterized queries to prevent SQL injection.
- **Compliance**: Cookie consent management (category-based) is enforced for all tracking activities.

## Implementation Details
- **Stripe**: All payment processing is handled by Stripe. No credit card information touches our servers. Webhook signatures are strictly verified.
- **Edge Gateway**: The Rust gateway handles routing, CORS, and request proxying to internal services. Rate limiting is planned as the next layer (tower middleware) but not yet active in the current release.
- **Content Security**: Markdown content is sanitized before rendering to prevent XSS.

## Reporting Vulnerabilities
If you discover a security vulnerability, please report it via the contact details on the [About](/about) page.
