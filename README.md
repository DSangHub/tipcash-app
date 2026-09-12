# TipCash

Public prototype: guest + server product aimed at the restaurant owner.

https://github.com/DSangHub/tipcash-app

- Guest: scan, short menu, tip, 5-day / 5–8% / $25 offer, optional membership
- Server: digital cash tips, pause on pool nights, FAQ
- Owner: Allow servers / House jar / Not now + repeat-visit math

## Pages

- `/` owner pitch
- `/guest/` customer scan flow
- `/server/` server home
- `/owner/` house dashboard

## Run

```bash
git clone https://github.com/DSangHub/tipcash-app.git
cd tipcash-app
python3 -m http.server 3000
```

Open http://localhost:3000
