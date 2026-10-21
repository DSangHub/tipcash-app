# TipCash prototype

Guest + server product aimed at the restaurant owner.

- Guest is happy: scan, see the Menu Tail (last plates), tap $5–$20, Apple Pay / Venmo / card. Venmo / Zelle QR on screen only if House / GM allows it. 5-day / 5–8% / $25 offer.
- Server is happy: guest tap connects to the linked money app — Venmo and Zelle with no TipCash cut; card / Apple Pay go through Stripe (~2.9% + $0.30). Pause on pool nights, FAQ, tax export.
- Owner wins: keep the check, pick Allow / House jar / Not now, choose whether Venmo / Zelle QRs appear under the Menu Tail, set how much servers keep on slow days vs busy weekend nights, offer TipCash to new hires for the holidays, sell a dessert tonight and a cover next week.
- Available for work: workers create a profile (name and zip displayed; phone private for eatery alerts). Toggle available for work with TipCash payouts. Eateries create an account, see workers near them, express interest. Normal interview process still required for new hires.

## Pages

- `/` owner pitch (copper-gold jar logo on the landing page)
- `/work/` worker profile — name and zip public, phone private, available for TipCash payouts
- `/eatery/` eatery account — choose an available worker near you
- `/guest/` customer scan flow
- `/server/` server home
- `/owner/` house controls + repeat-visit math
- `/flyer/` server flyer — Keep Smiling and Serving
- `/flyer/owner.html` owner / GM flyer + join email
- `/rails/` how a tip connects to Venmo, Zelle, or Stripe

## Run locally

```bash
cd /home/workdir/artifacts/tipcash
python3 -m http.server 3000
```

Open http://localhost:3000
