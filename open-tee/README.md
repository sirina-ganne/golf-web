# Open Tee

Open Tee is an OpenTable-style tee-time search MVP for golfers. It lets someone search nearby public, semi-private, and member-verified private course openings by location, date, radius, price, and number of open spots.

## Run Locally

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:5173/` by default.

## Current MVP

- Location search field with browser geolocation permission flow
- Filters for radius, max price, player count, course access, and date
- Public, semi-private, and private-member tee-time inventory examples
- Tee-time result cards with course imagery, pricing, open spots, rating, amenities, and distance
- Selected tee-time detail panel with reserve or membership verification action
- Responsive layout for desktop and mobile

## Next Product Steps

1. Replace sample inventory with live tee-time data from course management/POS systems, direct course integrations, or operator uploads.
2. Add accounts for golfers, course operators, and private club members.
3. Store courses, tee times, prices, holds, cancellation windows, and bookings in a backend database.
4. Add reservation checkout, confirmation emails/texts, and cancellation handling.
5. Add operator tools for inventory rules, resident pricing, member-only release windows, and no-show policies.
