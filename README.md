# Traveloop

Personalized travel-planning web app — pure HTML/CSS/JS, runs as a static site.

## Open
Open `index.html` in any modern browser. No build step required.

## Files
- `index.html` — Login / Signup
- `dashboard.html` — Home with upcoming trips & popular cities
- `trips.html` — My trips list
- `create-trip.html` — Create a new trip
- `itinerary.html` — Itinerary builder & viewer (list + calendar views)
- `cities.html` — City search
- `activities.html` — Activity search
- `budget.html` — Cost breakdown & budget alerts
- `packing.html` — Per-trip packing checklist
- `notes.html` — Trip notes / journal
- `share.html` — Share controls
- `public.html` — Public read-only itinerary view
- `profile.html` — User profile & settings
- `admin.html` — Analytics dashboard (optional)
- `styles.css` — Design system
- `app.js` — Client-side "DB" (localStorage) + helpers

## Data model (relational, in localStorage)
- users(id, name, email, password, createdAt)
- trips(id, userId, name, startDate, endDate, description, cover, transportBudget, budgetLimit, stops[], shared)
- stops(id, city, startDate, endDate, activities[])
- activities (seeded library + per-stop instances: name, type, cost, duration)
- cities (seeded: name, country, cost, popularity, img)
- notes(id, tripId, text, createdAt)
- packing(id, tripId, name, category, packed)
