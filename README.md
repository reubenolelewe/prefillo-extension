# Prefillo Chrome extension MVP

This is the Prefillo fork of [ritsth/job-autofill-extension](https://github.com/ritsth/job-autofill-extension), based on upstream commit `fb19fcd4e084c19b40a2207bda0c21ab09cddbf0`. The upstream project is MIT licensed; see `LICENSE` and `ATTRIBUTION.md`. The active Prefillo entry points are under `src/prefillo/`. Upstream files remain in the fork for attribution and future reference but are not imported by the MV3 manifest.

## Current behavior

- Greenhouse, Lever, and Ashby: fills only empty, high-confidence contact fields after a server license check. The side panel lists what it filled for review.
- Workday: copy-assist only. No Workday field injection.
- Login, CAPTCHA, and two-factor verification are handed back to the applicant.
- No application submission code, no LinkedIn host permission, no LinkedIn automation, and no password collection.
- Profile and license key or Firebase ID token are stored in `chrome.storage.local` on the device. The license key is checked against the Prefillo web companion before autofill.

## Build

Use Node 22 or newer. From this repository:

```sh
npm ci
npm run build
```

Set `PREFILLO_API_ORIGIN` and `VITE_PREFILLO_API_ORIGIN` to the **same HTTPS origin** for a production build. They default to `http://127.0.0.1:3000` for local development. Load `dist/` as an unpacked extension from `chrome://extensions` to use a local build. The web companion must have Firebase Admin and Firestore configured; otherwise license checks fail closed.

The Chrome Web Store package is `dist/` zipped without a private key. The store listing draft and publishing requirements are in `STORE_LISTING.md`. Do not publish a build pointed at localhost.
