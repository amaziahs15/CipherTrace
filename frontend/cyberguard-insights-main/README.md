# CyberGuard Insights

Build a police cybercrime intelligence dashboard with a dark navy/blue theme.

Page 1 - Main Dashboard with:
1. A header titled "Cybercrime Cash Withdrawal Prediction System"
2. A left panel form titled "New Complaint" with fields:
   - Victim Latitude (number input)
   - Victim Longitude (number input)
   - Fraud Amount in INR (number input)
   - Suspect Account Age in Days (number input)
   - Hour of Day, 0-23 (number input)
   - Day of Week, 0=Monday to 6=Sunday (dropdown)
   - Fraud Type (dropdown: UPI Fraud, Phishing, Fake Investment, OTP Fraud, Loan App Scam)
   - Bank (dropdown: SBI, HDFC, ICICI, Axis, PNB, Bank of Baroda)
   - A "Predict Withdrawal Location" button
3. A right panel "Prediction Result" showing (initially empty/placeholder):
   - Predicted Hotspot Zone ID
   - Confidence percentage as a colored badge (green >70%, yellow 40-70%, red <40%)
   - Estimated time window
   - Recommended action text in a highlighted box
4. Below both panels, a large interactive map (using Leaflet) showing markers for known hotspot zones, and a distinct highlighted marker for the current prediction when available
5. At the top, a stats bar showing: Total Complaints Processed, Number of Active Hotspots, Most Common Fraud Type

Use clean cards, rounded corners, and a professional law-enforcement dashboard look.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ea913239-0e8a-4c25-8e28-054672835bad).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

---

## Deploy to Netlify

This project uses `@netlify/vite-plugin-tanstack-start` for full Server-Side Rendering (SSR) and client asset deployment on Netlify.

### Configuration Overview
- **Build Command:** `npm run build`
- **Publish Directory:** `dist/client`
- **SSR Serverless Handler:** `.netlify/v1/functions/server.mjs`
- **Configuration File:** [`netlify.toml`](file:///c:/Users/AMAZIAH%20S/Downloads/CipherTrace/frontend/cyberguard-insights-main/netlify.toml)

### Environment Variables
Configure environment variables in the Netlify Dashboard (**Site settings** → **Environment variables**):
- `NODE_ENV`: `production`
- `VITE_APP_TITLE`: `CipherTrace - CyberShield AI`

### Deployment Options
1. **Git-based:** Import repository into Netlify. Netlify will auto-detect settings from `netlify.toml`.
2. **CLI-based:** Run `netlify deploy --prod` using Netlify CLI (v17.31+).

