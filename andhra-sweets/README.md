# Andhra Sweets — Wholesale Billing App

Billing app for a wholesale sweet shop. Make a bill for a buyer's shop, download it as a PDF, and send it on WhatsApp. Items, prices and shops are managed on their own pages, and everything is saved on the phone itself — no server, no login, no accounts to manage.

## Features

- **New Bill** — pick the buyer's shop, add sweets, set quantities, the total adds itself up.
- **Download / Send** — save the bill as a PDF, or share it straight to WhatsApp or any other app.
- **Items & Prices** — add sweets with their unit (kg, box, piece), set prices, mark items in or out of stock.
- **Shops** — keep the buyer shops you bill, plus your own business details printed on every bill.
- **Past Bills** — every saved bill, ready to reopen, redownload or resend.
- **Get App** — install it on the phone home screen so it opens full screen like a native app.

## Tech

- [TanStack Start](https://tanstack.com/start) (React 19 + Vite 7)
- TypeScript, Tailwind CSS v4, shadcn/ui
- [jsPDF](https://github.com/parallax/jsPDF) for bill PDFs
- Data persistence: browser `localStorage` (see `src/lib/store.ts`)

## Getting started

```sh
npm install
npm run dev
```

Open the printed address (usually http://localhost:8080).

Other scripts:

```sh
npm run build      # production build
npm run preview    # serve the production build
npm test           # run the unit tests
```

## Install it as a Chrome app (PWA)

This project is configured as a Progressive Web App. It is not a legacy Chrome Web Store packaged app; Chrome installs it from your deployed website.

1. Deploy the app to a host that serves it over **HTTPS** (localhost is suitable for development only).
2. Open the deployed website in desktop Google Chrome or Chrome on Android.
3. Desktop: use the install icon in the address bar, or Chrome menu → **Cast, save, and share** / **Install page as app** (wording varies by Chrome version).
4. Android: open the site in Chrome → ⋮ menu → **Install app** or **Add to Home screen**.
5. Open the installed **Andhra Sweets** icon to launch it in its own app window.

The manifest is `public/manifest.webmanifest`, icons are in `public/`, and `public/sw.js` provides basic caching/offline fallback. A first visit requires an internet connection. Because the app uses browser `localStorage`, its bills, shops, items and settings remain local to that browser/device; they are not synced between devices. Test bill creation, PDF downloads and WhatsApp sharing on the deployed URL before relying on it in production.

> **Note:** bills, items and shops are stored in that phone's browser storage. Clearing browser data or switching phones starts you from the sample data again.

## Project layout

```
src/
  routes/        one file per screen: /, /items, /shops, /bills, /install
  components/    AppNav.tsx (top and bottom navigation) and shadcn/ui primitives
  lib/
    store.ts     items, shops, bills and settings saved on the phone
    pdf.ts       builds the bill PDF and the download / WhatsApp share
```

## Deploying

Any static or edge host works: build with `npm run build` and publish the `dist` output. Keep the `public/` files reachable at the site root so the app stays installable.
