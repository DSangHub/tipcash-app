# TipCash prototype

Guest + server product aimed at the restaurant owner.

- Guest is happy: scan, short menu, tip, 5-day / 5–8% / $25 offer, optional membership.
- Server is happy: digital cash to their account, pause on pool nights, FAQ, tax export.
- Owner wins: keep the check, pick Allow / House jar / Not now, sell a dessert tonight and a cover next week.
- Book a server: a table is convenient; excellent service books the person. 2 days’ notice, party of 2+, may be closed on busy hours and weekends.

## Pages

- `/` owner pitch (copper-gold jar logo on the landing page)
- `/guest/` customer scan flow
- `/server/` server home
- `/owner/` house controls + repeat-visit math
- `/flyer/` server flyer — Keep Smiling and Serving
- `/flyer/owner.html` owner / GM flyer + join email

## Run locally

```bash
cd /home/workdir/artifacts/tipcash
python3 -m http.server 3000
```

Open http://localhost:3000
