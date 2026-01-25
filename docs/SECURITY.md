# Security Policy

## Reporting a Vulnerability

Please report security vulnerabilities to [f.kotaro.0530@gmail.com](mailto:f.kotaro.0530@gmail.com).

## Policy

*   **Stripe**: We use Stripe for payments. We do not store credit card information on our servers. All explicit payment processing is handled by Stripe.
*   **Data Privacy**:
    *   Cookie consents are stored to comply with privacy laws.
    *   Donation records are stored for accounting transparency but contain minimal personal data (Name, Message).
*   **Infrastructure**:
    *   All services run in isolated containers.
    *   Edge Gateway (Rust) handles rate limiting.
    *   Database access is restricted to the internal network.

## Supported Versions

| Service | Version | Supported |
| :--- | :--- | :--- |
| Furukawa OS | v1.0 | :white_check_mark: |
