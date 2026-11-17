# Security Policy

## Supported versions

PixelForge 1.x is the only supported line. Security fixes go to `main`.

## What PixelForge is (and is not)

PixelForge is a fully client-side static web app. It has no backend, no user accounts, no cookies, no analytics, and makes no network requests. Images you open are processed in memory in your own browser tab and never leave your machine.

## Reporting a vulnerability

If you find a security issue — for example, a way a crafted recipe file, image, or link could execute code or exfiltrate data — please report it privately rather than opening a public issue:

- Open a GitHub issue titled "SECURITY" is **not** the right route; instead, contact the repository owner directly through GitHub.

Please include a minimal reproduction (the recipe JSON, image, or URL that triggers it) and the browser/version you used. We will acknowledge within a few days and fix or explain the finding.

## Known safe-by-design properties

- Recipe import is strict JSON parsing with full validation (kind, version, keys, ranges, filter ids). A malformed recipe is rejected with an error, never executed.
- Image loading uses the browser's own image decoder (`<img>` / `drawImage`); no custom image parsing code runs.
- Exported files are generated locally via canvas `toDataURL`; nothing is uploaded anywhere.
